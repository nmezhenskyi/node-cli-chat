import net from 'net'
import { SocketLineBuffer } from './socket-line-buffer'
import { IOController } from './io-controller' 

/**
 * 
 */
export class ChatClient {
   socket: net.Socket
   lineBuffer: SocketLineBuffer
   cli: IOController

   constructor(host: string, port: number) {
      this.socket = new net.Socket()
      this.socket.setEncoding('utf-8')
      this.socket.connect(port, host)

      this.socket.on('error', this.handleError.bind(this))
      this.socket.on('close', this.handleClose.bind(this))

      this.lineBuffer = new SocketLineBuffer(this.socket)
      this.lineBuffer.on('line', this.register.bind(this))

      this.cli = new IOController()
      this.cli.on('say', this.writeToServer.bind(this))
      this.cli.on('close', this.disconnect.bind(this))
   }

   async register(message: string) {
      console.log(message)
      const name = await this.cli.prompt()
      this.writeToServer(name)

      this.lineBuffer.removeAllListeners('line')
      this.lineBuffer.on('line', this.readLine.bind(this))

      await this.cli.runInputLoop()
   }

   readLine(message: string) {
      this.cli.clearLine()
      this.cli.write(`${message}\n> `)
   }

   handleError(error: Error) {
      this.cli.write(error.message)
   }

   handleClose() {
      console.log('Disconnected.')
   }

   writeToServer(message: string) {
      this.socket.write(`${message}\n`, 'utf-8')
   }

   disconnect() {
      this.socket.destroy()
   }
}
