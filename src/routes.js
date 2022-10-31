import controller from "./Controller.js"
import CustomError from "./misc/CustomError.js"

controller.GET('/test', function (req, res) {
  // throw new CustomError(666, 'test')
})

export default controller
