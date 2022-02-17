# Node-cli-chat

## Description

TCP chat server & client created with Node.js. CLI is used for client interaction. The project serves as an example on how to work with the Node's standard library. The main focus is on streams (net socket, readline, stdin/stdout).

## Motivation

The idea behind the project is to write a simple TCP chat server & client using Node.js with no external dependencies. Exceptions are `typescript` and `@types/node` as devDependencies.

## Install & Run

1. Clone this repository.
2. Run `npm install --only=dev` for both the server and the client to install `typescript` and `@types/node` dependencies.
3. Run `npm run build` for both the server and the client.
4. Run `npm start` for the server and then for as many client instances as you want to test.

## Author

* [Nikita Mezhenskyi](https://github.com/nmezhenskyi)

## License

This project is licensed under MIT License (see LICENSE.md).
