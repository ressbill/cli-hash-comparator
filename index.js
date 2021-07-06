const crypto = require('crypto');
const fs = require('fs');
const util = require('util');
const http = require('http');

const errorCodes = require('./constants.js').errorCodes;

const filePath = process.argv[2];

const hash = crypto.createHash('sha256');


terminateIfNotFound(filePath, errorCodes.originalFileReadError)


const buffer = fs.readFileSync(filePath);
const sha256 = hash.update(buffer).digest('hex')
fs.writeFileSync(`${filePath}.sha256`, sha256 )

function terminateIfNotFound(filePath, errorCode) {
    if(!fs.existsSync(filePath)) {
        console.log("Файл не найден, проверьте путь", errorCode);
        process.exit(errorCode);
    }
}

class FileResourceGetter {
    filePath;
    hashedFilePath;
    orininalFileBuffer;
    hashedBuffer;
    
    constructor(filePath){
        this.filePath = filePath;
        this.hashedFilePath = filePath + '.sha256'
    }

    localResource(){
        terminateIfNotFound(this.filePath)
        const buffer = fs.readFileSync(this.filePath);
    }

    remoteResource(){
        const file = fs.createWriteStream("file.jpg");
        const request = http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function(response) {
        response.pipe(file);
        });
    }

    determineResource() {

    }
}


