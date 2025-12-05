// Fixed and cleaned-up version of your component
// Key fixes:
// - Moved useEffect out of removeImage
// - Corrected `new formData()` to `new FormData()`
// - Prevented state overrides on edit
// - Minor cleanup for required props

import { LoaderIcon, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"
import api from "./../config/axios"
import { getAllPublicListing, getAllUserListing } from "../app/features/ListingSlice"

const ManageListing = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userListings } = useSelector((store) => store.listing)
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  const [loadingListing, setLoadingListing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    platform: "",
    username: "",
    followers_count: "",
    engagement_rate: "",
    monthly_views: "",
    niche: "",
    price: "",
    description: "",
    verified: false,
    monetized: false,
    country: "",
    age_range: "",
    images: []
  })

  const platforms = ["youtube", "instagram", "tiktok", "facebook", "twitter", "linkedin", "pininterest", "snapchat", "twitch", "discord"]

  const niches = [
    "lifestyle",
    "fitness",
    "health",
    "travel",
    "gaming",
    "fashion",
    "beauty",
    "business",
    "education",
    "entertainment",
    "music",
    "art",
    "sports",
    "finance",
    "other"
  ]

  const ageRanges = ["13-17 years", "18-24 years", "25-34 years", "35-44 years", "45-54 years", "55+ years", "Mixed ages"]

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    if (!files.length) return

    if (files.length + formData.images.length > 5) {
      return toast.error("Can add up to 5 images")
    }

    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
  }

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove)
    }))
  }

  // Load listing for edit
  useEffect(() => {
    if (!id) return

    setIsEditing(true)
    setLoadingListing(true)

    const listing = userListings.find((l) => String(l.id) === String(id))

    if (listing) {
      setFormData({ ...listing, images: listing.images || [] })
      setLoadingListing(false)
    } else {
      toast.error("Listing not found")
      navigate("/my-listings")
    }
  }, [id, userListings])

  const handleSubmit = async (e) => {
    e.preventDefault()
    toast.loading("Saving...")
    const dataCopy = structuredClone(formData)
    try {
      if (isEditing) {
        dataCopy.images = formData.images.filter((image) => typeof image === "string")

        const formDataInstance = new FormData()
        formDataInstance.append('accountDetails', JSON.stringify(dataCopy))

        formData.images.filter((image) => typeof image !== "string").forEach((image) => {
          formDataInstance.append('images', image)
        })

        const token = await getToken()

        const { data } = await api.put('/listing', formDataInstance, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        toast.dismissAll()
        toast.success(data.message)
        await dispatch(getAllUserListing({ getToken }))

        dispatch(getAllPublicListing())
        navigate('/my-listings')
      } else {
        delete dataCopy.images;

        const formDataInstance = new FormData()
        formDataInstance.append('accountDetails', JSON.stringify(dataCopy))
        formData.images.forEach((image) => {
          formDataInstance.append('images', image)
        })

        const token = await getToken()
        const { data } = await api.post('/listing', formDataInstance, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        toast.dismissAll()
        toast.success(data.message)
        dispatch(getAllPublicListing())
        dispatch(getAllUserListing({ getToken }))
        navigate('/my-listings')
      }


    } catch (err) {
      toast.dismissAll()
      toast.error(err?.response?.data?.message || err.message)

      console.log(err)
    }

  }

  if (loadingListing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoaderIcon className="size-7 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{isEditing ? "Edit Listing" : "List your Account"}</h1>
          <p className="text-gray-600 mt-2">{isEditing ? "Update your existing account listing" : "Create a mock listing to display your account info"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Listing Title" value={formData.title} placeHolder="eg., Premium health Instagram Account" onChange={(v) => handleInputChange("title", v)} required />

              <SelectField label="Platform" options={platforms} value={formData.platform} onChange={(v) => handleInputChange("platform", v)} required />

              <InputField label="Username/Handle" value={formData.username} placeHolder="@username" onChange={(v) => handleInputChange("username", v)} required />

              <SelectField label="Niche/Category" options={niches} value={formData.niche} onChange={(v) => handleInputChange("niche", v)} required />
            </div>
          </Section>

          {/* Metrics */}
          <Section title="Account Metrics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <InputField label="Followers Count" type="number" min={0} value={formData.followers_count} onChange={(v) => handleInputChange("followers_count", v)} required />

              <InputField label="Engagement Rate (%)" type="number" min={0} value={formData.engagement_rate} onChange={(v) => handleInputChange("engagement_rate", v)} />

              <InputField label="Monthly Views/Impression" type="number" min={0} value={formData.monthly_views} onChange={(v) => handleInputChange("monthly_views", v)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputField label="Primary Audience Country" value={formData.country} onChange={(v) => handleInputChange("country", v)} required />

              <SelectField label="Primary Audience Age Range" options={ageRanges} value={formData.age_range} onChange={(v) => handleInputChange("age_range", v)} required />
            </div>

            <div className="space-y-6">
              <CheckBoxField label="Account is verified" checked={formData.verified} onChange={(v) => handleInputChange("verified", v)} />

              <CheckBoxField label="Account is monetized" checked={formData.monetized} onChange={(v) => handleInputChange("monetized", v)} />
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing & Description">
            <InputField label="Asking Price (USD)" type="number" value={formData.price} onChange={(v) => handleInputChange("price", v)} required />

            <TextAreaField label="Description" value={formData.description} onChange={(v) => handleInputChange("description", v)} required />
          </Section>

          {/* Images */}
          <Section title="Screenshots & Proof">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input type="file" id="images" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />

              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />

              <label htmlFor="images" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">Choose Files</label>

              <p className="text-sm text-gray-500 mt-2">Upload screenshots or proof of account analytics</p>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={typeof img === "string" ? img : URL.createObjectURL(img)} alt="listing" className="w-full h-24 object-cover rounded-lg" />
                    <button type="button" className="absolute -top-2.5 -right-2.5 size-6 bg-red-600 text-white rounded-full hover:bg-red-700" onClick={() => removeImage(index)}>x</button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <div className="flex justify-end gap-3 text-sm">
            <button onClick={() => navigate(-1)} type="button" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>

            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{isEditing ? "Update Listing" : "Create Listing"}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* Common Components */

const Section = ({ title, children }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    {children}
  </div>
)

const InputField = ({ label, value, onChange, placeHolder, type = "text", required = false, min = null, max = null }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input type={type} placeholder={placeHolder} min={min} max={max} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full px-3 py-1.5 text-gray-600 border rounded-md focus:ring-2 focus:ring-indigo-500 border-gray-300" />
  </div>
)

const SelectField = ({ label, options, value, onChange, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full px-3 py-1.5 text-gray-600 border rounded-md focus:ring-2 focus:ring-indigo-500 border-gray-300">
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
)

const CheckBoxField = ({ label, checked, onChange }) => (
  <label className="flex items-center space-x-2 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4" />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
)

const TextAreaField = ({ label, value, onChange, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full px-3 py-1.5 text-gray-600 border rounded-md focus:ring-2 focus:ring-indigo-500 border-gray-300" />
  </div>
)

export default ManageListing;
