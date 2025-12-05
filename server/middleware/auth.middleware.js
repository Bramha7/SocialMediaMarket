export const protect = async (req, res, next) => {
  try {
    const { userId, has } = await req.auth();
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false
      })
    }

    const hasPremiumPlan = await has({ plan: 'premium' })
    req.plan = hasPremiumPlan ? 'premium' : 'free'
    return next()

  } catch (err) {
    console.log(err)
    res.status(401).json({
      message: err.message || err.code,
      success: false
    })

  }

}

