import { Hono } from 'hono'
import s3App from './s3'

const app = new Hono()

app.get('/', (c) => c.text('Hello World!'))

// S3 APP
app.route('/s3', s3App)

export default app