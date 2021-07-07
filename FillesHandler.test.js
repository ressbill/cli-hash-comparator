const FilesHandler = require('./FilesHandler');
const constans = require('./constants');

const PATHS = {
  LOCAL: 'test.txt',
  REMOTE: 'https://leaderreaderjournal.com/wp-content/uploads/2021/01/dog.jpg',
};

/**
 * Здесь нужно создавать и удалять файлы перед тестом, чтобы время не тратить
 * воспользуемся уже созданными файлами, прикрепленными к проекту
 */
describe('valid resource type determination by path', () => {
  test('should define resource as local', () => {
    filesHandler = new FilesHandler(PATHS.LOCAL);
    filesHandler.determineResource();
    expect(filesHandler.resource).toBe(constans.RESOURCE_TYPE.LOCAL);
  });

  test('should define resource as remote', () => {
    filesHandler = new FilesHandler(PATHS.REMOTE);
    filesHandler.determineResource();
    expect(filesHandler.resource).toBe(constans.RESOURCE_TYPE.REMOTE);
  });
});

describe('local resource read works', () => {
  let filesHandler;
  beforeEach(() => {
    filesHandler = new FilesHandler(PATHS.LOCAL);
    filesHandler.determineResource();
  });

  test('should read files successfully', () => {
    filesHandler.localResource().then((success) => {
      expect(success).toBeTruthy();
    });
  });
});
