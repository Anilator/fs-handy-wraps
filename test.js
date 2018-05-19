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
  const fnDef = () => (console.log('Default config created'), ({ test: 'ok' }));
  const res = await FILE.getConfig(testFile, fnDef);
  expect(res.test).toBe('ok');
  await FILE.rm(testDir);
});
