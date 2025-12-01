import ListingCard from "./ListingCard"
import Title from "./Title"
import { useSelector } from "react-redux"

const LatestListing = () => {

  const { listings } = useSelector((store) => store.listing)

  return (
    <div className="mt-20 mb-8">
      <Title title={"Latest Listing"} description={'Discover the newly available social profiles available right now.'} />

      <div className="flex flex-col gap-6 px-6">{

        listings.slice(0, 4).map((listing, index) => (
          <div key={index} className="mx-auto w-full max-w-3xl rounded-xl">
            <ListingCard listing={listing} />

          </div>
        ))


      }</div>
    </div>
  )
}

export default LatestListing
