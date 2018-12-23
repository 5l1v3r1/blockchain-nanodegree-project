/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Auxiliar method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock() {
        let self = this;
        let block = new Block.Block("Genesis Block")
        self.getBlockHeight().then(function (height) {
            if (height === -1) {
                self.addBlock(block).then(function (result) {
                    console.log(result);
                }).catch((err) => { console.log(err) });
            }
        }).catch((err) => { reject(err) });
    }

    // Get block height, it is auxiliar method that return the height of the blockchain.
    getBlockHeight() {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.bd.getBlocksCount().then((count) => {
                resolve(count - 1);
            }).catch((err) => { reject(err) });
        });
    }

    // Add new block
    addBlock(block) {
        let self = this;
        return new Promise((resolve, reject) => {
            // Get lock height first.
            self.getBlockHeight().then((height) => {
                block.height = height + 1;
                // Set block time by UTC timestamp.
                block.time = new Date().getTime().toString().slice(0, -3);
                // Get previous block hash if the block height is larger than 0.
                if (block.height > 0) {
                    self.getBlock(block.height - 1).then((pre_block) => {
                        block.previousBlockHash = pre_block.hash;
                        // Block hash with SHA256 using newBlock and converting to a string
                        block.hash = SHA256(JSON.stringify(block)).toString();
                        // Add block to db.
                        self.bd.addLevelDBData(block.height, JSON.stringify(block)).then((result) => {
                            resolve(result);
                        }).catch((err) => { reject(err) });
                    }).catch((err) => { reject(err) });
                } else {
                    // This function will also be used by adding genesis block.
                    // Block hash with SHA256 using newBlock and converting to a string.
                    block.hash = SHA256(JSON.stringify(block)).toString();
                    // Add genesis block to database.
                    self.bd.addLevelDBData(block.height, JSON.stringify(block)).then((result) => {
                        resolve(result);
                    }).catch((err) => { reject(err) });
                }
            }).catch((err) => reject(err));
        });
    }

    // Get Block By Height
    getBlock(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.bd.getLevelDBData(height).then((block_string) => {
                resolve(JSON.parse(block_string));
            }).catch((err) => { reject(err) });
        });
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.getBlock(height).then((target_block) => {
                let origin_hash = target_block.hash;
                target_block.hash = ""
                let new_hash = SHA256(JSON.stringify(target_block)).toString();
                if (origin_hash === new_hash) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch((err) => reject(err));
        });
    }

    // Validate Blockchain
    validateChain() {
        let self = this;
        return new Promise((resolve, reject) => {
            let all_promises = [];
            self.getBlockHeight().then((total_block_nun) => {
                for (let height = 0; height < total_block_nun; height++) {
                    all_promises.push(self.validateBlock(height));
                }
            });
            Promise.all(all_promises).then((result) => {
                resolve(result);
            }).catch((err) => { reject(err) });
        });
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err) });
        });
    }

}

module.exports.Blockchain = Blockchain;