export default class CustomError extends Error {
  constructor(code, message) {
    super(message)
    // this.name = ""
    this.code = code
  }
}
