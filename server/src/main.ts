/**
 * Copyright (c) 2022 Nikita Mezhenskyi
 * All rights reserved.
 * 
 * This source code is licensed under MIT license (see LICENSE.md).
 * 
 */

import { ChatServer } from './chat-server'


const main = () => {
   try {
      const HOST = '127.0.0.1'
      const PORT = 4000

      const server = new ChatServer(HOST, PORT)

      process.on('SIGINT', () => {
         console.log()
         server.close()
         setImmediate(() => process.exit(0))
      })
   }
   catch (error: unknown) {
      console.error(error)
   }
}

main()
