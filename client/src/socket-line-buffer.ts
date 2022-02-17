import net from 'net'
import { EventEmitter } from 'events'
import { Buffer } from 'buffer'


/**
 * Listens for and buffers incoming data on a socket and emits a 'line'
 * event whenever a complete line has arrived.
 * 
 * `'line'` event contains a line with processed data.
 * 
 * 
 * @license GNU Free Documentation License 1.2
 * 
 * This class is a derivative work of a Rosetta Code solution
 * https://rosettacode.org/wiki/Chat_server#JavaScript.
 */
export class SocketLineBuffer extends EventEmitter {
   /**
    * Socket to listen to for incoming data.
    */
   private socket: net.Socket
   /**
    * Buffer that stores a single line of incoming data.
    */
   private buffer: string

   /**
    * @param socket Socket for listening
    */
   constructor(socket: net.Socket) { 
      super()
      this.socket= socket
      this.buffer = ''
      this.socket.on('data', this.handleData.bind(this))
   }

   /**
    * Reads incoming data. Emits 'line' event whenever a complete line has arrived and 
    * clears the accumulated buffer.
    * 
    * @param inBuffer Buffer with incoming data
    */
   private handleData(inBuffer: Buffer): void {
      const data = inBuffer.toString('utf-8')
      for (let i = 0; i < data.length; ++i) {
         const char = data.charAt(i)
         this.buffer += char
         if (char === '\n') {
            this.buffer = this.buffer.replace('\n', '')
            this.emit('line', this.buffer)
            this.buffer = ''
         }
      }
   }
}
