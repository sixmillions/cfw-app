import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import s3App from './s3'

const app = new Hono()

app.get('/', (c) => c.text('Hello World!'))

// favicon.ico
app.get('/favicon.ico', serveStatic({ path: './favicon.ico' }))

// S3 APP
app.route('/s3', s3App)

export default app
