export type Env = {
  ENDPOINT: string
  REGION: string
  ACCESS_KEY_ID: string
  SECRET_ACCESS_KEY: string
}

export type UploadBody = {
  file: File
  fullName: string
}
