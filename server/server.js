import express from 'express'
import 'dotenv/config'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/inngest.js"
import Listing from './routes/listing.routes.js'
import Chat from './routes/chat.routes.js'

import { clerkMiddleware } from '@clerk/express'
import cors from 'cors'


const app = express()

app.use(express.json())
app.use(cors(
  {
    origin: ['http://localhost:5173']
  }
))
app.use(clerkMiddleware())
app.use("/api/inngest", serve({ client: inngest, functions }));

app.get('/', (req, res) => {
  res.send("api is working...")
})

app.use('/api/listing', Listing)
app.use('/api/chat', Chat)


const port = process.env.PORT || 4000

app.listen(port, () => console.log(`Listening ......${port}`))
