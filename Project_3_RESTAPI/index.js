'use strict';

const Hapi = require('hapi');
const Joi = require('joi');
const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');

// Construct a chain.
let myBlockChain = new BlockChain.Blockchain();

// Create a server with a host and port
const server = Hapi.server({
    host: 'localhost',
    port: 8000
});

// Add the route
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, h) {

        return 'hello world';
    }
});

// Add a route for reading block.
server.route({
    method: 'GET',
    path: '/block/{height}',
    handler: (request, h) => {
        const height = encodeURIComponent(request.params.height);
        var block_string = myBlockChain.getBlock(height).then((block) => {
            return JSON.stringify(block).toString();
        }).catch((err) => {
            console.log(err);
            return err;
        });
        return block_string;
    }
});

// Add a route for adding block.
server.route({
    method: 'POST',
    path: '/block',
    handler: async (request, h) => {
        let data = request.payload['body'];
        let newBlock = new Block.Block(data);
        await myBlockChain.addBlock(newBlock);
        let height = await myBlockChain.getBlockHeight();
        let block_ = await myBlockChain.getBlock(height);
        return JSON.stringify(block_).toString();

    },
    options: {
        validate: {
            payload: Joi.object().keys({
                body: Joi.string().required()
            }).required()
        }
    }
});

// Start the server
const start = async function () {

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();