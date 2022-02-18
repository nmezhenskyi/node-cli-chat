import net from 'net'
import { SocketLineBuffer } from './socket-line-buffer'
import { IOController } from './io-controller' 

/**
 * Represents chat client that connects to the TCP server.
 */
export class ChatClient {
   /**
    * Socket that connects to the chat server.
    */
   private socket: net.Socket
   /**
    * SocketLineBuffer instance to read incoming messages.
    */
   private lineBuffer: SocketLineBuffer
   /**
    * I/O controller to interact with the user.
    */
   private cli: IOController

   /**
    * @param host Hostname to connect to
    * @param port Port number to connect to
    */
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

   /**
    * Called when the chat server sends its first message after
    * establishing the connection.
    * 
    * Handles registration on the server.
    * 
    * @param message Incoming message from the server
    */
   private async register(message: string) {
      console.log(message)
      const name = await this.cli.prompt()
      this.writeToServer(name)

      this.lineBuffer.removeAllListeners('line')
      this.lineBuffer.on('line', this.readLine.bind(this))

      await this.cli.runInputLoop()
   }

   /**
    * Called after successful registration on each incoming message from the server.
    * 
    * Displays incoming message to the user.
    * 
    * @param message Incoming message from the server
    */
   private readLine(message: string) {
      this.cli.clearLine()
      this.cli.write(`${message}\n> `)
   }

   /**
    * Called when the client encountered an error.
    * 
    * @param error Encoutered error
    */
   private handleError(error: Error) {
      this.cli.write(`Encountered error: ${error.message}\n`)
   }

   /**
    * Called when the user disconnected from the server and the connection
    * socket was closed.
    * 
    * @param error Flag whether an error caused the 'close' event
    */
   private handleClose(error: boolean) {
      if (error) return
      this.cli.clearLine()
      this.cli.write('Disconnected.\n')
   }

   /**
    * Sends a message to the chat server.
    * 
    * @param message Message to send
    */
   private writeToServer(message: string) {
      this.socket.write(`${message}\n`, 'utf-8')
   }

   /**
    * Disconnect from the server.
    */
   disconnect() {
      this.socket.destroy()
   }
}
