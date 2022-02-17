import net from 'net'
import { EventEmitter } from 'events'
import { SocketLineBuffer } from './socket-line-buffer'


/**
 * Represents TCP chat server.
 * 
 * 
 */
export class ChatServer {
   /**
    * Map of connected users who have successully joined (registered).
    * 
    * `K` - username  
    * `V` - associated User instance
    */
   private users: Map<string, User>
   /**
    * TCP server to listen for incoming connections.
    */
   private server: net.Server

   /**
    * Binds the TCP server to `host` and `port` and starts listening
    * for connections.
    * 
    * @param host Hostname
    * @param port Port number
    */
   constructor(host: string, port: number) {
      this.users = new Map<string, User>()
      this.server = net.createServer(this.handleConnection.bind(this))
      this.server.on('error', this.handleError.bind(this))
      this.server.on('close', this.handleClose.bind(this))
      this.server.listen(port, host, () => {
         console.log(`Server started on ${host}:${port}.`)
      })
   }

   handleConnection(connection: net.Socket): void {
      connection.setEncoding('utf-8')
      let user = new User(connection, this)
      user.on('join', this.handleJoin.bind(this))
      user.on('say', this.handleSay.bind(this))
      user.on('leave', this.handleLeave.bind(this))
   }

   handleJoin(user: User) {
      console.log(`${user.username} has joined the chat room.`)
      this.addUser(user)
      this.sendToAll(`${user.username} has joined the chat room.`)
   }

   handleSay(user: User, message: string) {
      console.log(`${user.username}: ${message}`)
      this.sendToAllExcept(user, `${user.username}: ${message}`)
   }

   handleLeave(user: User) {
      console.log(`${user.username} has left the chat room.`)
      this.removeUser(user)
      this.sendToAll(`${user.username} has left the chat room.`)
   }

   handleError(error: Error) {
      console.error(error)
   }

   handleClose() {
      console.log('Server has been shutdown.')
   }

   addUser(user: User) {
      this.users.set(user.username, user)
   }

   removeUser(user: User) {
      this.users.delete(user.username)
   }

   sendToAll(message: string) {
      this.users.forEach(user => user.writeToClient(message))
   }

   sendToAllExcept(except: User, message: string) {
      this.users.forEach(user => {
         if (user.username !== except.username) {
            user.writeToClient(message)
         }
      })
   }

   isUsernameValid(username: string): boolean {
      if (!/^[A-Za-z0-9]{1,12}$/.test(username)) {
         return false
      }

      for (const user of this.users.values()) {
         if (user.username === username) {
            return false
         }
      }

      return true
   }

   close() {
      this.users.forEach(user => user.leave({ forcedDisconnect: true }))
      this.server.close()
   }
}


/**
 * Represents a single user connection to the server.
 */
class User extends EventEmitter {
   /**
    * Connected socket.
    */
   socket: net.Socket
   /**
    * Reference to the associated ChatServer instance.
    */
   server: ChatServer
   /**
    * Registered username. If not yet registered, the value is empty string.
    */
   username: string
   /**
    * SocketLineBuffer instance to read incoming messages.
    */
   lineBuffer: SocketLineBuffer

   /**
    * Creates a User instance. Asks the client socket for the username.
    * 
    * @param socket connection socket
    * @param server associated ChatServer instance
    */
   constructor(socket: net.Socket, server: ChatServer) {
      super()

      this.socket = socket
      this.server = server
      this.username = ''
      this.lineBuffer = new SocketLineBuffer(socket)

      this.lineBuffer.on('line', this.join.bind(this))
      this.socket.on('close', this.leave.bind(this))

      this.writeToClient('Enter your name:')
   }

   join(username: string): void {
      if (!this.server.isUsernameValid(username)) {
         this.writeToClient('Selected name is invalid or already taken.')
         this.writeToClient('Please select a different one:')
         return
      }

      this.username = username
      this.lineBuffer.removeAllListeners('line')
      this.lineBuffer.on('line', this.say.bind(this))
      this.emit('join', this)
   }

   say(line: string): void {
      this.emit('say', this, line)
   }

   /**
    * 
    * 
    * @param options 
    */
   leave(options?: { forcedDisconnect: boolean }): void {
      if (options?.forcedDisconnect)
         this.socket.destroy()
      else
         this.emit('leave', this)
   }

   /**
    * Writes to the client socket.
    * 
    * @param message Message to send
    */
   writeToClient(message: string): void {
      this.socket.write(`${message}\n`)
   }
}
