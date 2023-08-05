import { S3Client, ListBucketsCommand, CreateBucketCommand, DeleteBucketCommand, BucketAlreadyOwnedByYou } from '@aws-sdk/client-s3'

const listBucket = async (s3Client: S3Client) => {
  const command = new ListBucketsCommand({})
  try {
    const { Owner = {}, Buckets = [] } = await s3Client.send(command)
    console.log(`${Owner.DisplayName} owns ${Buckets.length} bucket${Buckets.length === 1 ? '' : 's'}:`)
    console.log(`${Buckets.map((b) => ` • ${b.Name}`).join('\n')}`)
    return { Owner, Buckets }
  } catch (err) {
    // console.error(err);
    return {}
  }
}

const createBucket = async (s3Client: S3Client, bucketName: string) => {
  console.log(`Creating bucket ${bucketName}`)
  const command = new CreateBucketCommand({ Bucket: bucketName })
  try {
    const { Location } = await s3Client.send(command)
    console.log(`Bucket ${bucketName} created with location ${Location}`)
    return true
  } catch (error) {
    if (error instanceof BucketAlreadyOwnedByYou) {
      console.log(`Bucket ${bucketName} already exists, skipping...`)
      return true
    } else {
      console.error(`Error creating bucket ${bucketName}`, error)
      return false
    }
  }
}

const deleteBucket = async (s3Client: S3Client, bucketName: string) => {
  const command = new DeleteBucketCommand({ Bucket: bucketName })
  try {
    const response = await s3Client.send(command)
    console.log('deleteBucket', response)
    return true
  } catch (err) {
    const typedError = err as Error
    console.error('delete bucket error: ', err)
    if (typedError?.message.includes('FileReader')) {
      // TODO：BUG  ReferenceError: FileReader is not defined
      // https://github.com/aws/aws-sdk-js-v3/issues/4765
      return true
    }
    if (typedError?.name === 'BucketNotEmpty' || typedError?.name === 'NoSuchBucket') {
      console.error('bucket must empty | bucket no exist')
    }
    return false
  }
}

export { listBucket, createBucket, deleteBucket }
