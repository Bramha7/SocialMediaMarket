
// adding listing to database

import imagekit from "../config/imageKit.js";
import prisma from "../config/prisma.js";
import fs from 'fs'

export const addListing = async (req, res) => {
  try {

    const { userId } = await req.auth();
    if (req.plan !== 'premium') {
      const listingCount = await prisma.listing.count({
        where: { ownerId: userId }
      })
      if (listingCount >= 5) {
        return res.status(400).json({
          message: "you have reached the free listing limit"
        })
      }
    }

    const accountDetails = JSON.parse(req.body.accountDetails)

    accountDetails.followers_count = parseFloat(accountDetails.followers_count)
    accountDetails.engagement_rate = parseFloat(accountDetails.engagement_rate)
    accountDetails.monthly_views = parseFloat(accountDetails.monthly_views)
    accountDetails.price = parseFloat(accountDetails.price)
    accountDetails.platform = accountDetails.platform.toLowerCase()
    accountDetails.niche = accountDetails.niche.toLowerCase()

    accountDetails.username.startsWith("@") ? accountDetails.username = accountDetails.username.slice(1) : null;




    const uploadImages = req.files.map(async (file) => {
      const response = await imagekit.files.upload({
        file: fs.createReadStream(file.path),
        folder: "MediaSell",
        fileName: `${Date.now()}.png`,
        transformation: { pre: "w-1280, h-auto" }
      })
      return response.url

    })


    const images = await Promise.all(uploadImages)
    const listing = await prisma.listing.create({
      data: {
        ownerId: userId,
        images,
        ...accountDetails
      }
    })

    return res.status(201).json({
      message: "Account listed successfully",
      listing,
      success: true
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: err.message
    })

  }

};

// export const getAllPubliclisting = async (req, res) => {
//   try {
//     const listings = await prisma.listing.findMany({
//       where: { status: "active" },
//       include: { owner: true },
//       orderBy: { createdAt: "desc" }
//     })
//     if (!listings || listings.length === 0) {
//       res.json({
//         listings: []
//       })
//       return res.json({ listings })
//
//     }
//
//   } catch (err) {
//
//     res.status(500).json({
//       message: err.message
//     })
//
//     console.log(err)
//   }
// }



export const getAllPubliclisting = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "active" },
      include: { owner: true },
      orderBy: { createdAt: "desc" }
    })

    // Always respond, whether empty or not
    return res.status(200).json({ listings })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}


// controller for getting all user listing

export const getAllUserListing = async (req, res) => {
  try {
    const { userId } = await req.auth()
    // get all listings except deleted
    const listings = await prisma.listing.findMany({
      where: {
        ownerId: userId,
        status: { not: "deleted" },
      },

      orderBy: { createdAt: "desc" }

    })

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    const balance = {
      earned: user.earned,
      withdrawn: user.withdrawn,
      available: user.earned - user.withdrawn,
    }
    if (!listings || listings.length === 0) {
      return res.json({ listings: [], balance })
    }
    return res.json({
      listings, balance
    })

  } catch (err) {

    console.log(err)
    res.status(500).json({
      message: err.message
    })

  }
}


export const updateListing = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const accountDetails = JSON.parse(req.body.accountDetails);

    if (
      (req.files?.length || 0) + (accountDetails.images?.length || 0) > 5
    ) {
      return res.status(400).json({
        message: "You can upload only up to 5 images",
      });
    }

    accountDetails.followers_count = Number(accountDetails.followers_count);
    accountDetails.engagement_rate = Number(accountDetails.engagement_rate);
    accountDetails.monthly_views = Number(accountDetails.monthly_views);
    accountDetails.price = Number(accountDetails.price);

    accountDetails.platform = accountDetails.platform?.toLowerCase();
    accountDetails.niche = accountDetails.niche?.toLowerCase();

    if (accountDetails.username?.startsWith("@")) {
      accountDetails.username = accountDetails.username.slice(1);
    }

    const listing = await prisma.listing.findFirst({
      where: {
        id: accountDetails.id,
        ownerId: userId,
      },
    });

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found!!",
        success: false,
      });
    }

    if (listing.status === "sold") {
      return res.status(400).json({
        message: "You can't update a sold listing",
      });
    }

    let updatedImages = listing.images || [];

    if (req.files?.length > 0) {
      const uploadImages = req.files.map(async (file) => {
        const response = await imagekit.files.upload({
          file: fs.createReadStream(file.path),
          folder: "MediaSell",
          fileName: `${Date.now()}.png`,
          transformation: { pre: "w-1280, h-auto" },
        });
        return response.url;
      });

      const images = await Promise.all(uploadImages);
      updatedImages = [...updatedImages, ...images];
    }

    const updatedListing = await prisma.listing.update({
      where: {
        id: accountDetails.id,
      },
      data: {
        ...accountDetails,
        images: updatedImages,
      },
    });

    return res.json({
      message: "Account updated successfully",
      listing: updatedListing,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = await req.auth();

    const listing = await prisma.listing.findUnique({
      where: { id, ownerId: userId }
    })

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found"
      })
    }

    if (listing.status === 'active') {
      await prisma.listing.update({
        where: { id, ownerId: userId },
        data: { status: listing.status === "active" ? "inactive" : "active" }
      })
    } else if (listing.status === "ban") {
      return res.status(400).json({
        message: "Your listing is banned"
      })
    } else if (listing.status === "sold") {
      return res.status(400).json({
        message: "Your listing is sold"
      })
    }
    return res.json({
      message: "Listing status updated successfully",
      success: true
    })

  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: err.message,
      success: false
    })

  }
}

export const deleteUserlisting = async (req, res) => {
  try {
    const { userId } = await req.auth()
    const { listingId } = req.params;

    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        ownerId: userId
      },
      include: { owner: true }
    })

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found"
      })
    }

    if (listing.status === "sold") {
      return res.status(400).json({
        message: "sold listing can't be deleted"
      })
    }
    // if password has been changed, send new password to owner
    if (listing.isCredentialChanged) {
      // send email to owner
    }

    await prisma.listing.update({
      where: {
        id: listingId
      },
      data: {
        status: "deleted"
      }
    })
    return res.json({
      message: "Listing deleted successfully"
    })




  } catch (err) {

    console.log(err)
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

export const addCredential = async (req, res) => {
  try {
    const { userId } = req.auth()
    const { listingId, credential } = req.body
    if (credential.length === 0 || !listingId) {
      return res.status(400).json({
        message: "Missing Fields"
      })

    }

    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId, ownerId: userId
      }
    })

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found or you are not the owner"
      })
    }

    await prisma.credential.create({
      data: {
        listingId,
        originalCredential: credential
      }
    })
    await prisma.listing.update({
      where: {
        id: listingId
      },
      data: {
        isCredentialSubmitted: true
      }
    })
    return res.json({
      message: "Credential added successfully"
    })

  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: err.message
    })

  }
}

export const markFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = await req.auth();

    if (req.plan !== 'premium') {
      return res.status(400).json({
        message: "Premium plan required"
      })
    }
    await prisma.listing.updateMany({
      where: {
        ownerId: userId
      },
      data: {
        featured: false
      }
    })


    await prisma.listing.update({
      where: {
        id
      },
      data: {
        featured: true
      }
    })
    return res.json({
      message: "Listing marked as featured"
    })

  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: err.message
    })

  }
}

export const getAllUserOrders = async (req, res) => {
  try {
    const { userId } = await req.auth()
    let orders = await prisma.transaction.findMany({
      where: {
        userId, isPaid: true
      },
      include: { listing: true }
    })

    if (!orders || orders.length === 0) {
      return res.json({
        orders: []
      })
    }

    const credentials = await prisma.credential.findMany({
      where: {
        listingId: {
          in: orders.map((order) => order.listingId)
        }
      }
    })

    const ordersWithCredentials = orders.map((order) => {
      const credential = credentials.find((cred) => cred.listingId === order.listingId)
      return { ...order, credential }


    })
    return res.json({
      orders: ordersWithCredentials
    })

  } catch (err) {

    console.log(err)
    res.status(500).json({
      message: err.message
    })

  }
}

export const withdrawAmount = async (req, res) => {
  try {
    const { userId } = await req.auth()
    const { amount, account } = req.body

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    const balance = user.earned - user.withdrawn
    if (amount > balance) {
      return res.status(400).json({
        message: "Insufficient balance!!",
        success: false
      })
    }
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId, amount, account
      }
    })

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        withdrawn: { increment: amount }
      }
    })
    res.json({
      message: "applied for withdrawal", withdrawal
    })

  } catch (err) {

    console.log(err)
    res.status(500).json({
      message: err.message
    })

  }
}

export const puchaseAccount = async (req, res) => {
  try {


  } catch (err) {

    console.log(err)
    res.status(500).json({
      message: err.message
    })

  }

}
