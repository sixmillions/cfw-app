import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import s3App from './s3'
import blogApp from './blog'

const app = new Hono()

// 允许跨域
app.use('*', cors())

app.get('/', (c) => c.text('Hello World!'))

// favicon.ico
app.get('/favicon.ico', serveStatic({ path: './favicon.ico' }))

// S3 APP
app.route('/s3', s3App)

// Obsidian
app.route('/api/v1/blog', blogApp)

export default app
