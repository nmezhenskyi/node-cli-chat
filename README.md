# Node-cli-chat

## Description

TCP chat server & client created with Node.js. CLI is used for client interaction. The project serves as an example on how to work with Node's `net` and `readline` modules.

## Motivation

The idea behind the project is to write a simple TCP chat server & client using Node.js with no external dependencies. Exceptions are `typescript` and `@types/node` as devDependencies. Inspired by [Rosetta Code solution](https://rosettacode.org/wiki/Chat_server#JavaScript).

## Install & Run

1. Clone this repository.
2. Run `npm install --only=dev` for both the server and the client to install `typescript` and `@types/node` dependencies.
3. Run `npm run build` for both the server and the client.
4. Run `npm start` for the server and then for as many client instances as you want to test.

## Author

* [Nikita Mezhenskyi](https://github.com/nmezhenskyi)

## License

This source code is licensed under MIT License (see LICENSE.md) with some exceptions that are licensed under GNU Free Documentation License 1.2. Exceptions are explicitly mentioned in the source code with `@license` notes.
