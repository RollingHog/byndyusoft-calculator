import http from 'http'
import { CONFIG } from './config.js'
import controller from './src/routes.js'
import CustomError from './src/misc/CustomError.js'
import { sleep } from './src/misc/sleep.js'

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function serverHandlerRaw(req, res) {

  if(CONFIG.ALLOW_CORS) {
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
    throw new CustomError(400, 'Method not allowed')
  }

  await sleep(CONFIG.REQUEST_TIMEOUT)
  if(!res.headersSent) {
    throw new CustomError(408, 'Timeout')
  }
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function serverHandler(req, res) {
  console.log((new Date()).toJSON(), req.method, req.url)
  try {
    await serverHandlerRaw(req, res)
  } catch (e) {
    console.log(e.code, e.message)
    if(e instanceof CustomError) {
      res.writeHead(e.code)
      res.end(`ERROR ${e.code}\n\n` + e.message)
    } else {
      console.log(e.stack)
      res.writeHead(500)
      res.end('ERROR 500 \n\nInternal server error')
    }
  }
}

const server = http.createServer(serverHandler)

//   // GET
//   // res.writeHead(200, { "Content-Type": "text/html" })
//   // fs.createReadStream("./public/form.html", "UTF-8").pipe(res)
//   // POST
//   // res.writeHead(200, { "Content-Type": "text/html" })
//   // res.end(body)

server.listen(CONFIG.SERVER_PORT)
