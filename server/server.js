import express from 'express'
import 'dotenv/config'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/inngest.js"

import { clerkMiddleware } from '@clerk/express'
import cors from 'cors'


const app = express()

app.use(express.json())



app.use(cors())
app.use(clerkMiddleware())

app.get('/', (req, res) => {
  res.send("api is working...")
})

app.use("/api/inngest", serve({ client: inngest, functions }));


const port = process.env.PORT || 4000

app.listen(port, () => console.log(`Listening ......${port}`))
