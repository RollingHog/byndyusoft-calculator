import CustomError from "./misc/CustomError.js"
import { VERSION } from "./VERSION.js"

const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
}

/**
 * @callback ControllerCallbackFunction
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {string} [body=null]
*/

class Controller {
  constructor() {
    this.routes = {}
    this.routes[HTTP_METHOD.GET] = {}
    this.routes[HTTP_METHOD.POST] = {}

    this.lastDoc = null
  }

  /**
   * @param {string} method
   * @param {string} route
   * @param {ControllerCallbackFunction} callback
   */
  add(method, route, callback) {
    method = method.toUpperCase()
    if(this.routes[method] == undefined) throw new Error(`Method ${method} not allowed`)

    this.routes[method][route] = { callback }

    if(this.lastDoc !== null) {
      this.routes[method][route].doc = this.lastDoc
      this.lastDoc = null
    }

  }

  /**
   * @param {string} route
   * @param {ControllerCallbackFunction} callback
   */
  GET(route, callback) {
    return this.add(HTTP_METHOD.GET, route, callback)
  }

  /**
   * @param {string} route
   * @param {ControllerCallbackFunction} callback
   */
  POST(route, callback) {
    return this.add(HTTP_METHOD.POST, route, callback)
  }

  doc(str) {
    this.lastDoc = str
    return this
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse<http.IncomingMessage>} res
   * @param {string} [body]
   */
  parse(req, res, body=null) {
    const {method, url} = req
    let result = null
    if(this.routes[method][url])
      result = this.routes[method][url].callback(req, res, body)
    else {
      throw new CustomError(404, 'route do not exist')
    }

    if(typeof result === 'string') {
      res.writeHead(200, { "Content-Type": "text/html" })
      res.end(result)
    }
  }
}

const controller = new Controller()

controller
.doc('maps all existing routes; should be DEV mode only')
.GET('/routes', () => {
  const list = []
  for(let method in controller.routes) {
    for(let route in controller.routes[method]) {
      // list.push({method: i, url: j})
      list.push(`<tr><td>${method}</td><td><a href="${route}">${route}</a></td><td>${controller.routes[method][route].doc}</td></tr>`)
    }
  }
  return `<table>${list.join('')}</table>`
})

controller
.doc('returns server version')
.GET('/version', () => VERSION)

export default controller
