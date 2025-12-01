import { configureStore } from '@reduxjs/toolkit'
import listingReducer from './features/ListingSlice.js'
import chatReducer from './features/ChatSlice.js'


export const store = configureStore({
  reducer: {
    listing: listingReducer,
    chat: chatReducer
  }
})
