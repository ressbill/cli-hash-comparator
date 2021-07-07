const http = require('http');
const fs = require('fs');
const errorCodes = require('./constants.js').errorCodes;
const RESOURCE_TYPE = require('./constants.js').RESOURCE_TYPE;

function terminateIfNotFoundLocal(filePath, errorCode) {
  if (!fs.existsSync(filePath)) {
    console.log(`[ERROR] Файл не найден, проверьте путь: ${filePath}`);
    process.exit(errorCode);
  }
}

function terminateIfNotFoundRemote(filePath, errorCode, response) {
  if (response.statusCode === 404) {
    console.log(`[ERROR] Файл не найден, проверьте путь: ${filePath}`);
    process.exit(errorCode);
  }
}

class FilesHandler {
  originalFileBuffer;
  sha256FileHashString;

  /**
   * Источник: файлы с диска или из интернета {RESOURCE_TYPE}
   */
  resource;

  constructor(filePath) {
    this.filePath = filePath;
    this.hashedFilePath = filePath + '.sha256';
    this.determineResource();
  }

  localResource() {
    return new Promise((resolve) => {
      terminateIfNotFoundLocal(this.filePath, errorCodes.originalFileReadError);
      terminateIfNotFoundLocal(this.hashedFilePath, errorCodes.hashFileReadError);

      this.originalFileBuffer = fs.readFileSync(this.filePath);
      this.sha256FileHashString = fs.readFileSync(this.hashedFilePath, 'utf8');
      resolve(true);
    });
  }

  remoteResource() {
    return new Promise((resolve) => {
      const filesSuccessfullyFetched = [false, false];

      http.get(this.filePath, (response) => {
        terminateIfNotFoundRemote(this.filePath, errorCodes.originalFileReadError, response);

        const data = [];

        response.on('data', (chunk) => {
          data.push(chunk);
        });
        response.on('end', () => {
          this.originalFileBuffer = Buffer.concat(data);
          filesSuccessfullyFetched[0] = true;
          if (filesSuccessfullyFetched[1]) {
            resolve(true);
          }
        });

        response.on('error', () => {
          process.exit(errorCodes.originalFileReadError);
        });
      });

      http.get(this.hashedFilePath, (response) => {
        terminateIfNotFoundRemote(this.hashedFilePath, errorCodes.originalFileReadError, response);

        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          this.sha256FileHashString = data;
          filesSuccessfullyFetched[0] = true;
          if (filesSuccessfullyFetched[1]) {
            resolve(true);
          }
        });

        response.on('error', () => {
          process.exit(errorCodes.hashFileReadError);
        });
      });
    });
  }

  fetchResource() {
    return this.resource === RESOURCE_TYPE.LOCAL ? this.localResource() : this.remoteResource();
  }

  determineResource() {
    if (this.filePath.startsWith('http')) {
      this.resource = RESOURCE_TYPE.REMOTE;
    } else {
      this.resource = RESOURCE_TYPE.LOCAL;
    }
  }
}
module.exports = FilesHandler;
