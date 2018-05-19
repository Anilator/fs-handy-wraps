const FILE = require('./files');

const testDir = './test';
const testFile = './test/file';

test('readOrMakeFile test', async () => {
  const res = await FILE.rom(testFile, 'ok');
  expect(res).toBe('ok');
});
test('remove test', async () => {
  const res = await FILE.rm(testDir);
  expect(res).toBe(true);
});

test('getConfig promise test', async () => {
  const fnPromDef = () => {
    console.log('Default config got from a promise');
    return Promise.resolve({ test: 'ok' });
  };
  const res = await FILE.getConfig(testFile, fnPromDef);
  expect(res.test).toBe('ok');
  await FILE.rm(testDir);
});
test('getConfig Function test', async () => {
  const fnDef = () => {
    console.log('Default config got from a function');
    return { test: 'ok' };
  };
  const res = await FILE.getConfig(testFile, fnDef);
  expect(res.test).toBe('ok');
  await FILE.rm(testDir);
});
test('getConfig Object test', async () => {
  const objDef = { test: 'ok' };
  // there is no way to notify about a default config with just an object
  const res = await FILE.getConfig(testFile, objDef);
  expect(res.test).toBe('ok');
  await FILE.rm(testDir);
});
