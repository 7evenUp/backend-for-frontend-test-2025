import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import env from "dotenv"
import { createClient } from "@supabase/supabase-js"

env.config()

const app = express()
const supabase = createClient(
  process.env.DATABASE_URL,
  process.env.DATABASE_API_KEY
)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.get("/", (_, response) =>
  response.json({ info: "Express app with Supabase" })
)

app.get("/profile", async (req, res) => {
  const jwt = req.headers["authorization"]

  const { data, error } = await supabase.auth.getUser(jwt)

  if (error) {
    res.status(error.status).json({ code: error.code, message: error.message })
    return
  }

  res.json({ email: data.user.email, id: data.user.id })
})

app.post("/login", async (req, res) => {
  if (!req.body.email) {
    res.status(400).send("Bad request. There is no `email` field in request")
    return
  }

  if (!req.body.password) {
    res.status(400).send("Bad request. There is no `password` field in request")
    return
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: req.body.email,
    password: req.body.password,
  })

  if (error) {
    res.status(error.status).json({ code: error.code, message: error.message })

    return
  }

  res.json({ token: data.session.access_token, type: data.session.token_type })
})

app.post("/register", async (req, res) => {
  if (!req.body.email) {
    res.status(400).send("Bad request. There is no `email` field in request")
    return
  }

  if (!req.body.password) {
    res.status(400).send("Bad request. There is no `password` field in request")
    return
  }

  const { data, error } = await supabase.auth.signUp({
    email: req.body.email,
    password: req.body.password,
  })

  if (error) {
    res.status(error.status).json({ code: error.code, message: error.message })

    return
  }

  res.json({ token: data.session.access_token, type: data.session.token_type })
})

app.listen(process.env.PORT || 4000, () =>
  console.log(
    new Date().toLocaleTimeString() + `: Server is running on port 3000...`
  )
)

export default app
