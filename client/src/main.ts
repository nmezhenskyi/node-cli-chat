import { stdout } from 'node:process'
import { ChatClient } from './chat-client'


const main = async () => {
   try {
      stdout.write('Welcome to node-cli-chat!\n')

      const PORT = 4000
      const HOST = '127.0.0.1'

      const client = new ChatClient(HOST, PORT)

      process.on('SIGINT', () => {
         stdout.write('\n')
         client.disconnect()
         setImmediate(() => process.exit(0))
      })
   }
   catch (error: unknown) {
      console.error(error)
   }
}

main()
