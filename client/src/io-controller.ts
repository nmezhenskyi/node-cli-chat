import readline from 'readline'
import { stdin, stdout } from 'node:process'
import { EventEmitter } from 'events'

/**
 * Handles I/O operations using specified read/write streams.  
 * By default uses stdin/stdout.
 */
export class IOController extends EventEmitter {
   /**
    * Read stream used as input.
    */
   private input: NodeJS.ReadStream
   /**
    * Write steam used as output.
    */
   private output: NodeJS.WriteStream

   /**
    * @param input Read stream to use as input
    * @param output Write stream to use as output
    */
   constructor(input = stdin, output = stdout) {
      super()
      this.input = input
      this.output = output
      this.input.setEncoding('utf-8')
      this.output.setEncoding('utf-8')
   }

   /**
    * Prompts the user asynchronously.
    * 
    * @param query Query to display before input
    * @returns Input string provided by user
    */
   prompt(query: string = '> '): Promise<string> {
      return new Promise(resolve => {
         const rl = readline.createInterface(this.input, this.output)
         rl.question(query, answer => {
            resolve(answer)
            rl.close()
         })
      })
   }

   /**
    * Starts an async input loop that accepts input from the user.
    * 
    * - On '/q' emits 'close' event.
    * - On '/h' shows a help message.
    * - Any other input string emits 'say' event.
    * - On SIGINT exits the loop, closes the stream, and propagates SIGINT to the process level.
    */
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

   /**
    * Writes the data to the underlying write stream.
    * 
    * @param data Data to write
    */
   write(data: string) {
      this.output.write(data)
   }

   /**
    * Clears the line in the underlying write stream.
    */
   clearLine() {
      this.output.clearLine(0)
      this.output.cursorTo(0)
   }
}
