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
    this.routes[HTTP_METHOD.GET] = {
      '/routes': {},
      '/version': {},
    }
    this.routes[HTTP_METHOD.GET]['/routes'] = () => JSON.stringify(this.routes,  (key, val) => typeof val === 'function' ? '[Function]' : val)
    this.routes[HTTP_METHOD.GET]['/version'] = () => VERSION
    this.routes[HTTP_METHOD.POST] = {}
  }

  /**
   * @param {string} method
   * @param {string} route
   * @param {ControllerCallbackFunction} callback
   */
  add(method, route, callback) {
    method = method.toUpperCase()
    if(this.routes[method] == undefined) throw new Error(`Method ${method} not allowed`)

    this.routes[method][route] = callback

  }

  /**
   * @param {string} method
   * @param {string} route
   * @param {ControllerCallbackFunction} callback
   */
  GET(route, callback) {
    this.add(HTTP_METHOD.GET, route, callback)
  }

  /**
   * @param {string} method
   * @param {string} route
   * @param {ControllerCallbackFunction} callback
   */
  POST(route, callback) {
    this.add(HTTP_METHOD.POST, route, callback)
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
      result = this.routes[method][url](req, res, body)
    else {
      throw new CustomError(404, 'route do not exist')
    }

    if(typeof result === 'string') {
      res.writeHead(200, { "Content-Type": "text/html" })
      res.end(result)
    }
  }
}

export const controller = new Controller()
