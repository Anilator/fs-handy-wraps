# Handy Wraps for Node.js FS

A pretty simple library.

## Installation

`npm i -S fs-handy-wraps` or `yarn add fs-handy-wraps`

----

## Read and Write files

All the functions are promisified. Only first argument is required.

**check** (path[, existCallback, absentCallback])
> Checks the file existence. All arguments are required.

**read** (path[, successCallback, errCallback])
> Reads the file contents.

**write** (path[, text, successCallback, errCallback])
> Rewrites the file content by `text` or an empty string. Also may be used for a new file creation.

**append** (path[, text, successCallback, errCallback])
> Appends `text` or an empty string to the end of the file.

**rom** (path[, makeCallback, readCallback])
> Reads the file if it exists and calls readCallback then.
> Creates a new file if a file specified by `path` does not exist and fills it by `newFileContent` if specified and executes `makeCallback (path, newFileContent)` then.

**dir** (path[, successCallback, errCallback])
> Creates a directory specified by `path`. This function is imported from `fs-extra`. [Here is its documentation](https://github.com/jprichardson/node-fs-extra/blob/master/docs/ensureDir.md).

----

## Read or Create a JSON config-file using simple CLI

**getConfig** (path[, defaultValues, CLIQuestions, successCallback, errCallback])
> Reads the `path` file, checks if for JSON errors and calls `successCallback (parsedConfig)`.
> Launches a simple CLI according to `CLIQuestions` if the `path` file does not exist.
Example for `CLIQuestions` object:

```js
const CLIQuestions_EXAMPLE = [
    { prop: 'pathToBase',     question: 'Full path to database file:' },
    { prop: 'pathToNotefile', question: 'Path to temp file:' },
    { prop: 'editor',         question: 'Command to open your text editor:' },
];
```

It asks `CLIQuestions` to user, then assigns received values to a `defaultValues` object.
A callback `successCallback (config)` will be executed in the result.

----

## Watching on file changes

This function cannot be promisified.

**watch** (path, callback)
> Creates a Watcher that will call the `callback` every time a file specified by `path` is changed.
> There are a 30ms delay between the system event and the callback is called.

----

## Usage example (with callbacks)

```js
const FILE = require('fs-handy-wraps');
const configPath = '~/config.json';
const configDefaults = {
    base: '~/base.txt',
    name: 'My new Project'
};
const cli = [
    { prop: 'base', question: 'Where to store the database?' },
    { prop: 'name', question: 'What is the name of your Project?' },
];

start();

function start() {
    FILE.getConfig (configPath, configDefaults, cli, checkBase);
}
function checkBase (config) {
    FILE.rom (config.base, createNewBase, parseBase);
}
function parseBase (baseContent) {
    // do something with baseContent...
}
function createNewBase (resolve, reject) {
    // do something to get the new base content...
    resolve(content);
}
```

## Usage with promises (async / await syntax)

```js
const FILE = require('fs-handy-wraps');

const pathDefaultFile = 'fileDef.txt';
const pathFile = 'file.txt';

// if pathFile is already exists --> read it
// else --> create a new file based on the another one.
(async function start() {
    const content = await FILE.rom(pathFile, makeDefault);
    console.log(content);

    async function makeDefault(resolve, reject) {
        resolve(await FILE.read(pathDefaultFile));
    }
})()
```
