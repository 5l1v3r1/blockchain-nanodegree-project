# Project 3: Connect Private Blockchain to Front-End Client via APIs

Use REST api to get and add blocks in the Blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Node.js

### Installing

From project folder, run:
```bash
npm install
```

## Running the tests

I have already add some data in the chain. You can try to add a block and then get it, or, get the first block.

### Get a block.

Configure a GET request using URL path with a block height parameter.
```
http://localhost:8000/block/0
```

### Add a block.

Use the following URL with the block data in the request payload. Note the input in payload should be in JSON format.
```
http://localhost:8000/block
```

## Versioning

The first version for review.

## Acknowledgments

* The Hapi.js documentation.
