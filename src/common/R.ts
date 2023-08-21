export class R<T> {
  code: number
  success: boolean
  message: string
  time: Date
  data: T

  constructor(code: number, success: boolean, message: string, data: T) {
    this.code = code
    this.success = success
    this.message = message
    this.data = data
    this.time = new Date()
  }

  static success<T>(data: T) {
    return new R<T>(200, true, 'success', data)
  }

	static fail(code: number, message: string = 'fail') {
    return new R<null>(code, false, message, null)
  }

}
