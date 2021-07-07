const crypto = require('crypto');
const errorCodes = require('./constants.js').errorCodes;
const FilesHandler = require('./FilesHandler');

const filePath = process.argv[2];

const filesHandler = new FilesHandler(filePath);
filesHandler.determineResource();

filesHandler
  .fetchResource()
  .then(() => {
    const originalFileHash = crypto.createHash('sha256');

    const originalFileHashString = originalFileHash.update(filesHandler.originalFileBuffer).digest('hex');

    const sha256FileHashString = filesHandler.sha256FileHashString.toString('hex');

    if (originalFileHashString !== sha256FileHashString) {
      console.log('[ERROR] Хэши не совпадают');
      process.exit(errorCodes.unmatchingHashError);
    }

    console.log('[SUCCESS] хэши файлов совпадают');
  })
  .catch((e) => {
    console.log('[ERROR] ', e);
    process.exit(1);
  });
