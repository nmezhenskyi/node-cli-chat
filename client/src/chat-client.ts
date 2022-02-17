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
      this.cli = new IOController()
      this.cli.on('say', this.writeToServer.bind(this))
      this.cli.on('close', this.disconnect.bind(this))
      this.cli.write('Welcome to node-cli-chat!\n')

      this.socket = new net.Socket()
      this.socket.setEncoding('utf-8')
      this.socket.connect(port, host)

      this.socket.on('error', this.handleError.bind(this))
      this.socket.on('close', this.handleClose.bind(this))

      this.lineBuffer = new SocketLineBuffer(this.socket)
      this.lineBuffer.on('line', this.register.bind(this))
   }

   private async register(message: string) {
      console.log(message)
      const name = await this.cli.prompt()
      this.writeToServer(name)

      this.lineBuffer.removeAllListeners('line')
      this.lineBuffer.on('line', this.readLine.bind(this))

      await this.cli.runInputLoop()
   }

   private readLine(message: string) {
      this.cli.clearLine()
      this.cli.write(`${message}\n> `)
   }

   private handleError(error: Error) {
      this.cli.write(`Encountered error: ${error.message}\n`)
   }

   private handleClose(error: boolean) {
      if (error) return
      this.cli.clearLine()
      this.cli.write('Disconnected.\n')
   }

   private writeToServer(message: string) {
      this.socket.write(`${message}\n`, 'utf-8')
   }

   disconnect() {
      this.socket.destroy()
   }
}
