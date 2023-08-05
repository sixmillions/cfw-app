import { Hono } from 'hono'
const app = new Hono()

// TODO Swagger
app.get('/', (c) => c.text('S3 OSS Page'))

/**
 * TODO
 * Bucket Api
 */
app
  .get('bucket', async (c) => {
    return c.text('Bucket List')
  })
  .post(async (c) => {
    return c.text('Bucket Create')
  })
  .post(async (c) => {
    return c.text('Bucket Delete')
  })

/**
 * TODO
 * Object
 */
app
  .get('obj/:bucket', async (c) => {
    return c.text('Object List')
  })
  .post(async (c) => {
    return c.text('Object Create')
  })
  .post(async (c) => {
    return c.text('Object Delete')
  })

export default app
