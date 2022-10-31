import http from 'http'
import controller from './src/routes.js'
import CustomError from './src/misc/CustomError.js'

const SERVER_PORT = 8080
const ALLOW_CORS = true
const REQUEST_TIMEOUT = 5000

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function serverHandlerRaw(req, res) {

  if(ALLOW_CORS) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept')
  }

  if (req.method === "GET") {
      controller.parse(req, res)
  } else if (req.method === "POST") {

      let body = ""
      req.on("data", function (chunk) {
          body += chunk
      })

      req.on("end", function(){
        controller.parse(req, res, body)
      })
  } else if (req.method === "OPTIONS") {
    res.writeHead(200)
    res.end('')
  } else {
    res.writeHead(400)
    res.end('Method not allowed')
  }

}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function serverHandler(req, res) {
  console.log((new Date()).toJSON(), req.method, req.url)
  try {
    serverHandlerRaw(req, res)
  } catch (e) {
    console.log(e.code, e)
    if(e instanceof CustomError) {
      res.writeHead(e.code)
      res.end('ERROR\n\n' + e.message)
    } else {
      res.writeHead(500)
      res.end('Internal server error')
    }
  }

  setTimeout( _ => {
    if(!res.headersSent)
    res.writeHead(408)
    res.end('Timeout')
  }, REQUEST_TIMEOUT)
}

const server = http.createServer(serverHandler)

// function mainController(req, res, body = null) {
//   // GET
//   // res.writeHead(200, { "Content-Type": "text/html" })
//   // fs.createReadStream("./public/form.html", "UTF-8").pipe(res)
//   // POST
//   // res.writeHead(200, { "Content-Type": "text/html" })
//   // res.end(body)
// }

server.listen(SERVER_PORT)
