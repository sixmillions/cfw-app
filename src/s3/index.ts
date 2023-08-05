import { Hono } from 'hono'
import { Env, UploadBody } from '../model'
import { S3Client } from '@aws-sdk/client-s3'
import { listBucket, createBucket, deleteBucket } from './bucket'
import { uploadObject, listObject, deleteObject } from './s3Obj'
import { fileNameHandler } from './util'

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
    if (client == null) {
      return c.json({ isSuccess: false, msg: 'client not init.' })
    }
    const bucketList = await listBucket(client)
    return c.json(bucketList)
  })
  .post(async (c) => {
    if (client == null) {
      return c.json({ isSuccess: false, msg: 'client not init.' })
    }
    const bucket: { name: string } = await c.req.json()
    const isSuccess = await createBucket(client, bucket.name)
    return c.json({ isSuccess })
  })
  .delete(async (c) => {
    if (client == null) {
      return c.json({ isSuccess: false, msg: 'client not init.' })
    }
    const bucket: { name: string } = await c.req.json()
    const isSuccess = await deleteBucket(client, bucket.name)
    return c.json({ isSuccess })
  })

/**
 * TODO
 * Object
 */
app
  .get('obj/:bucket', async (c) => {
    if (client == null) {
      return c.json({ isSuccess: false, msg: 'client not init.' })
    }
    let bucket = c.req.param('bucket')
    let limit = c.req.query('limit')
    let limitNum = 10
    if (limit) {
      limitNum = parseInt(limit)
    }
    const res = await listObject(client, bucket, limitNum)
    return c.json(res)
  })
  .post(async (c) => {
    if (client == null) {
      return c.json({ isSuccess: false, msg: 'client not init.' })
    }
    let bucket = c.req.param('bucket')
    const body = await c.req.parseBody()
    const { fullName, file }: UploadBody = body as UploadBody
    const { _fullName } = fileNameHandler(fullName, file.name)
    await uploadObject(client, bucket, _fullName, file)
    return c.json({ url: `${c.env.ENDPOINT}/${bucket}/${_fullName}` })
  })
  .post(async (c) => {
    if (client == null) {
      return c.json({ isSuccess: false, msg: 'client not init.' })
    }
    let bucket = c.req.param('bucket')
    const ossObj: { name: string } = await c.req.json()
    const isSuccess = await deleteObject(client, bucket, ossObj.name)
    return c.json({ isSuccess })
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
