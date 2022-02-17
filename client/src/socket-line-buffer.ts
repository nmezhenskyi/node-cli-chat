import net from 'net'
import { EventEmitter } from 'events'
import { Buffer } from 'buffer'


/**
 * Listens for and buffers incoming data on a socket and emits a 'line'
 * event whenever a complete line has arrived.
 */
export class SocketLineBuffer extends EventEmitter {
   private socket: net.Socket
   private buffer: string

   constructor(socket: net.Socket) { 
      super()
      this.socket= socket
      this.buffer = ''
      this.socket.on('data', this.handleData.bind(this))
   }

   private handleData(inBuffer: Buffer): void {
      const data = inBuffer.toString('utf-8')
      for (let i = 0; i < data.length; ++i) {
         const char = data.charAt(i)
         this.buffer += char
         if (char === '\n') {
            this.buffer = this.buffer.replace('\r\n', '')
            this.buffer = this.buffer.replace('\n', '')
            this.emit('line', this.buffer)
            this.buffer = ''
         }
      }
   }
}
