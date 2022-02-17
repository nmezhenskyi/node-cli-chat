import net from 'net'
import { EventEmitter } from 'events'
import { SocketLineBuffer } from './socket-line-buffer'


/**
 * Represents TCP chat server.
 * 
 * Listens for connections, registers users, broadcasts user messages.
 * 
 * 
 * @license GNU Free Documentation License 1.2
 * 
 * This class is a derivative work of a Rosetta Code solution
 * https://rosettacode.org/wiki/Chat_server#JavaScript.
 */
export class ChatServer {
   /**
    * Map of registered users (who have successully joined).
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

   /**
    * Called when the server receives a new connection.
    * 
    * @param connection Connected socket
    */
   private handleConnection(connection: net.Socket): void {
      connection.setEncoding('utf-8')
      let user = new User(connection, this)
      user.on('join', this.handleJoin.bind(this))
      user.on('say', this.handleSay.bind(this))
      user.on('leave', this.handleLeave.bind(this))
   }

   /**
    * Called when a connected user has successfully registered on the server.
    * 
    * @param user Registered user
    */
   private handleJoin(user: User): void {
      console.log(`${user.username} has joined the chat room.`)
      this.addUser(user)
      this.broadcast(`${user.username} has joined the chat room.`)
   }

   /**
    * Called when a registered user sends a chat message.
    * 
    * @param user User who sent a message
    * @param message Sent message
    */
   private handleSay(user: User, message: string): void {
      console.log(`${user.username}: ${message}`)
      this.broadcastExcept(user, `${user.username}: ${message}`)
   }

   /**
    * Called when a user has left the server.
    * 
    * @param user User who left the server
    */
   private handleLeave(user: User): void {
      console.log(`${user.username} has left the chat room.`)
      this.removeUser(user)
      this.broadcast(`${user.username} has left the chat room.`)
   }

   /**
    * Called when the server encountered an error.
    * 
    * @param error Encountered errror
    */
   private handleError(error: Error): void {
      console.error(error)
   }

   /**
    * Called when the server has been closed.
    */
   private handleClose(): void {
      console.log('Server has been shutdown.')
   }

   /**
    * Adds a User to the list of registered users.
    * 
    * @param user User to add
    */
   private addUser(user: User): void {
      this.users.set(user.username, user)
   }

   /**
    * Removes a User from the list of registered users.
    * 
    * @param user User to remove
    */
   private removeUser(user: User): void {
      this.users.delete(user.username)
   }

   /**
    * Broadcasts a message to all registered users.
    * 
    * @param message Message to broadcast
    */
   private broadcast(message: string): void {
      this.users.forEach(user => user.writeToClient(message))
   }

   /**
    * Broadcasts a message to all registered users, except for one (usually the original sender).
    * 
    * @param except User not to broadcast to
    * @param message Message to broadcast
    */
   private broadcastExcept(except: User, message: string): void {
      this.users.forEach(user => {
         if (user.username !== except.username) {
            user.writeToClient(message)
         }
      })
   }

   /**
    * Validates the username. Must be unique, between 1-12 characters, 
    * and contain only letters and numbers.
    * 
    * @param username Username to validate
    * @returns True if valid, false otherwise
    */
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

   /**
    * Forcibly closes all open connections and closes the server.
    */
   close(): void {
      this.users.forEach(user => user.leave({ forcedDisconnect: true }))
      this.server.close()
   }
}


/**
 * Represents a single user connection to the server.
 * 
 * 
 * @license GNU Free Documentation License 1.2
 * 
 * This class is a derivative work of a Rosetta Code solution
 * https://rosettacode.org/wiki/Chat_server#JavaScript.
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
    * Any received data will be considered as a username until the user has
    * successfully joined (registered).
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

   /**
    * Attempts to register the user in the chat server. If successful,
    * starts accepting chat messages. Otherwise, asks to select a different
    * username and try to register again.
    * 
    * Registration is not persistent and is valid only for the duration of the 
    * session.
    * 
    * @param username Username to register on the server
    */
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
    * Automatically called when the connection is closed on the client side and emits 'leave' event.  
    * Can also be manually called on the server side (requires passing 
    * `options` parameter with `forcedDisconnect: true`) and does not emit 'leave' event.
    * 
    * @param options Object with options: forcedDisconnect
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
