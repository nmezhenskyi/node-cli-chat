/**
 * Copyright (c) 2022 Nikita Mezhenskyi
 * All rights reserved.
 * 
 * This source code is licensed under MIT license (see LICENSE.md)
 * unless otherwise noted.
 * 
 */

import { ChatClient } from './chat-client'


const main = async () => {
   try {
      const [portArg, hostArg] = process.argv.slice(2)
      const PORT = portArg && !isNaN(Number(portArg)) ? Number(portArg) : 4000
      const HOST = hostArg || '127.0.0.1'

      const client = new ChatClient(HOST, PORT)

      process.on('SIGINT', () => client.disconnect())
   }
   catch (error: unknown) {
      console.error(error)
   }
}

main()
