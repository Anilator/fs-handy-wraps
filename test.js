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

test('getConfig test', async () => {
  const res = await FILE.getConfig(testFile, { test: 'ok' });
  expect(res.test).toBe('ok');
  await FILE.rm(testDir);
});
