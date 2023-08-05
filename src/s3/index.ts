import { Hono } from 'hono'
import { Env } from '../model'
import { S3Client } from '@aws-sdk/client-s3'

const app = new Hono<{ Bindings: Env }>()

let client: S3Client | null = null

app.use('*', async (c, next) => {
  // init client
  client = s3Client(c.env)
  await next()
})

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

const s3Client = function (env: Env): S3Client {
  return new S3Client({
    region: env.REGION,
    endpoint: env.ENDPOINT,
    credentials: {
      accessKeyId: env.ACCESS_KEY_ID,
      secretAccessKey: env.SECRET_ACCESS_KEY,
    },
    // use path style: https://hostname/bucket/object
    forcePathStyle: true,
  })
}
export default app
