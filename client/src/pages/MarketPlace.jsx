import { ArrowLeftIcon, Filter, FilterIcon } from "lucide-react"
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from 'react-router-dom'
import ListingCard from "../components/ListingCard";
import FilterSidebar from "./FilterSidebar";


const MarketPlace = () => {

  const [searchParams] = useSearchParams()
  const search = searchParams.get('search');

  const [filters, setFilters] = useState({
    platform: null,
    maxPrice: 100000,
    minFollowers: 0,
    niche: null,
    verified: false,
    monetized: false,
  })

  const { listings } = useSelector(store => store.listing)

  const filteredListings = listings.filter((listing) => {



    if (filters.platform && filters.platform.length > 0) {
      if (!filters.platform.includes(listing.platform)) return false
    }

    if (filters.maxPrice) {
      if (listing.price > filters.maxPrice) return false
    }



    if (filters.minFollowers) {
      if (listing.followers_count < filters.minFollowers) return false
    }

    if (filters.niche && filters.niche.length > 0) {
      if (!filters.niche.includes(filters.minFollowers)) return false
    }

    if (filters.verified && listing.verified !== filters.verified) return false

    if (filters.monetized && listing.monetized !== filters.monetized) return false

    if (search) {
      const trimd = search.trim()
      if (!listing.title.toLowerCase().includes(trimd.toLowerCase()) &&
        !listing.username.toLowerCase().includes(trimd.toLowerCase()) &&

        !listing.description.toLowerCase().includes(trimd.toLowerCase()) &&

        !listing.platform.toLowerCase().includes(trimd.toLowerCase()) &&
        !listing.niche.toLowerCase().includes(trimd.toLowerCase())
      )
        return false
    }

    return true
  })

  const [showFilterMobile, setShowFilterMobile] = useState(false)
  const navigate = useNavigate();
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32">
      {/*div one*/}
      <div className="flex items-center justify-between text-slate-500">
        <button
          onClick={() => {
            navigate('/');
            window.scrollTo(0, 0);
          }}
          className="flex items-center gap-2 py-5"
        >

          <ArrowLeftIcon className="size-4" />
          Back to Home</button>
        <button onClick={() => setShowFilterMobile(true)} className="flex sm:hidden items-center gap-2 py-6">
          <FilterIcon className="size-4" />

          Filters</button>

      </div>
      {/*div two*/}
      <div className="relative   flex items-start justify-between gap-8 pb-8">
        <FilterSidebar setFilters={setFilters} filters={filters} setShowFilterPhone={setShowFilterMobile} showFilterPhone={showFilterMobile} />

        {/*list of marketplace items*/}
        <div className="flex-1 grid xl:grid-cols-2 gap-4">
          {
            filteredListings.sort((a, b) => a.featured ? -1 : b.featured ? 1 : 0).map((listing, index) => (
              <ListingCard listing={listing} key={index} />


            ))
          }

        </div>

      </div>

    </div >
  )
}

export default MarketPlace
