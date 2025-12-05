import { Route, Routes, useLocation } from "react-router-dom"

import Home from "./pages/Home"
import MyListings from "./pages/MyListings"
import MyOrder from "./pages/MyOrder"
import MarketPlace from "./pages/MarketPlace"
import ListingDetails from "./pages/ListingDetails"
import ManageListing from "./pages/ManageListing"
import Messages from "./pages/Messages"
import Loading from "./pages/Loading"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { Chatbox } from "./components/Chatbox"
import { Toaster } from "react-hot-toast"
import Layout from "./pages/admin/Layout"
import Dashboard from "./pages/admin/Dashboard"
import CredentialVerify from "./pages/admin/CredentialVerify"
import CredentialChange from "./pages/admin/CredentialChange"
import Transaction from './pages/admin/Transactions'
import AllListings from "./pages/admin/AllListings"
import Withdrawal from "./pages/admin/Withdrawal"
import { useAuth, useUser } from "@clerk/clerk-react"
import { useDispatch } from "react-redux"
import { useEffect } from "react"
import { getAllPublicListing, getAllUserListing } from "./app/features/ListingSlice"





function App() {
  const { pathname } = useLocation();
  const { getToken } = useAuth()
  const { user, isLoaded } = useUser()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getAllPublicListing())

  }, [])

  useEffect(() => {
    if (isLoaded && user) {
      dispatch(getAllUserListing({ getToken }))
    }

  }, [isLoaded, user])


  return (
    <>
      <Toaster />

      {!pathname.includes("/admin") && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/my-orders" element={<MyOrder />} />
        <Route path="/market-place" element={<MarketPlace />} />
        <Route path="/listing/:listingId" element={<ListingDetails />} />
        <Route path="/create-listing" element={<ManageListing />} />
        <Route path="/edit-listing/:id" element={<ManageListing />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/loading" element={<Loading />} />

        {/* Admin routes */}
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />

          <Route path="verify-credentials" element={<CredentialVerify />} />
          <Route path="change-credentials" element={<CredentialChange />} />
          <Route path="transactions" element={<Transaction />} />
          <Route path="list-listings" element={<AllListings />} />
          <Route path="withdrawal" element={<Withdrawal />} />
        </Route>
      </Routes>

      {!pathname.includes("/admin") && <Footer />}
      <Chatbox />
    </>
  );
}

export default App;
