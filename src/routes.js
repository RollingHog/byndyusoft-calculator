import controller from "./framework/Controller.js"
import CustomError from "./misc/CustomError.js"

controller
.doc('throws error with custom code')
.GET('/test/ce', function () {
  throw new CustomError(666, 'test')
})

controller
.doc('throws regular js error')
.GET('/test/e', function () {
  throw new Error('default error')
})

export default controller
