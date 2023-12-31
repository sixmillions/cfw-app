export type Env = {
  ENDPOINT: string
  REGION: string
  ACCESS_KEY_ID: string
  SECRET_ACCESS_KEY: string
  TOKEN: string
  DB_URL: string
}

export type UploadBody = {
  file: File
  fullName: string
}
