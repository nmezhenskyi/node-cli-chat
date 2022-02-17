import readline from 'readline'
import { stdin, stdout } from 'node:process'
import { EventEmitter } from 'events'

/**
 * Handles I/O operations using specified read/write streams.  
 * By default uses stdin/stdout.
 */
export class IOController extends EventEmitter {
   private input: NodeJS.ReadStream
   private output: NodeJS.WriteStream

   constructor(input = stdin, output = stdout) {
      super()
      this.input = input
      this.output = output
      this.input.setEncoding('utf-8')
      this.output.setEncoding('utf-8')
   }

   prompt(query: string = '> '): Promise<string> {
      return new Promise(resolve => {
         const rl = readline.createInterface(this.input, this.output)
         rl.question(query, answer => {
            resolve(answer)
            rl.close()
         })
      })
   }

   runInputLoop(): Promise<void> {
      return new Promise(resolve => {
         const rl = readline.createInterface(this.input, this.output)
   
         rl.setPrompt('> ')
         rl.prompt()
   
         rl.on('line', line => {
            if (line === '/q' || line === '/quit') {
               rl.close()
               this.emit('close')
               return
            }
            
            if (line === '/h' || line === '/help') {
               this.write('CLI Commands:\n'
                  + '  * \'[message]\' + enter to send message\n'
                  + '  * \'/q\' + enter to quit\n'
                  + '  * \'/h\' + enter to view commands\n')
            }
            else {
               this.emit('say', line)
            }
   
            rl.prompt()
         })
   
         rl.on('close', resolve)

         rl.on('SIGINT', () => {
            rl.close()
            process.emit('SIGINT', 'SIGINT')
         })
      })
   }

   write(data: string) {
      this.output.write(data)
   }

   clearLine() {
      this.output.clearLine(0)
      this.output.cursorTo(0)
   }
}
