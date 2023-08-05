import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, _Object } from '@aws-sdk/client-s3'

const uploadObject = async (client: S3Client, bucketName: string, objName: string, file: File) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objName,
    Body: file.stream(),
    ContentType: file.type,
    ContentLength: file.size,
  })
  try {
    const response = await client.send(command)
    console.log('uploadObject success: ', response)
  } catch (err) {
    console.error('uploadObject error: ', err)
  }
}

const listObject = async (client: S3Client, bucketName: string, limit: number = 10) => {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    // The default and maximum number of keys returned is 1000. This limits it to
    // one for demonstration purposes.
    MaxKeys: 10,
  })
  try {
    let isTruncated = true

    console.log('Your bucket contains the following objects:\n')
    // let contents = '';
    let contents: _Object[] = []
    let count = 0
    while (isTruncated) {
      console.log('----get: ', ++count)
      if (contents.length >= limit) {
        console.log('break get object')
        break
      }
      const { Contents, IsTruncated, NextContinuationToken } = await client.send(command)
      // const contentsList = Contents?.map((c) => {console.log('+++++',c);return ` • ${c.Key}`}).join('\n');
      // contents += contentsList + '\n';
      contents = contents.concat(Contents as _Object[])
      isTruncated = IsTruncated as boolean
      command.input.ContinuationToken = NextContinuationToken
    }
    // console.log(contents);
    return contents
  } catch (err) {
    console.error(err)
  }
}

const deleteObject = async (client: S3Client, bucketName: string, fullName: string) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fullName,
  })

  try {
    const response = await client.send(command)
    console.log(response)
    return true
  } catch (err) {
    const typedError = err as Error
    console.error('delete bucket error: ', err)
    if (typedError?.message.includes('FileReader')) {
      // TODO：BUG  ReferenceError: FileReader is not defined
      // https://github.com/aws/aws-sdk-js-v3/issues/4765
      return true
    }
    return false
  }
}

export { uploadObject, listObject, deleteObject }
