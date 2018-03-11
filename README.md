# npm i -S fs-handy-wraps
Handy wraps for some Node.js FileSystem functions.  
A pretty simple library.


.


## Read and Write files
**check** (path, existCallback, absentCallback)
> Checks the file existence. All arguments are required.

**read** (path, successCallback[, errCallback])
> Reads the file contents.

**makeDir** (path, successCallback[, errCallback])
> Creates a directory specified by `path` with `0777` rights.

**write** (path[, text, successCallback, errCallback])
> Rewrites the file content by `text` or an empty string. Also may be used for a new file creation.

**append** (path[, text, successCallback, errCallback])
> Appends `text` or an empty string to the end of the file.

**readOrMake** (path, readCallback, makeCallback[, newFileContent])
> Reads the file if it exists and calls readCallback then.  
> Creates a new file if a file specified by `path` does not exist and fills it by `newFileContent` if specified and executes `makeCallback (path, newFileContent)` then.


.


## Read or Create a JSON config-file using simple CLI
**getConfig** (path, successCallback[, defaultValues, CLIQuestions, errCallback])
> Reads the `path` file, checks if for JSON errors and calls `successCallback (parsedConfig)`.  
> Launches a simple CLI according to `CLIQuestions` if the `path` file does not exist.  
Example for `CLIQuestions` object:  
```js
const CLIQuestions_EXAMPLE = [
    { prop: 'pathToBase',       question: 'Full path to database file:' },
    { prop: 'pathToNotefile',   question: 'Path to temp file:' },
    { prop: 'editor',           question: 'Command to open your text editor:' },
];
```
It asks `CLIQuestions` to user, then assigns received values to a `defaultValues` object.
A callback `successCallback (config)` will be executed in the result.

.


## Watching on file changes
**watch** (path, callback)
> Creates a Watcher that will call the `callback` every time a file specified by `path` is changed.  
> There are a 30ms delay between the system event and the callback is called.

.


## Usage example
```js
start();

const FILE = require('fs-handy-wraps');
const configPath = '~/config.json';
const configDefaults = {
    base: '~/base.txt',
    name: 'My new Project'
};
const cli = [
    { prop: 'base',   question: 'Where to store the database?' },
    { prop: 'name',   question: 'What is the name of your Project?' },
];

function start() {
    FILE.getConfig (configPath, checkBase, configDefaults, cli);
}
function checkBase (config) {
    FILE.readOrMake (config.base, parseBase, newBaseCreated);
}
function parseBase (baseContent) {
    // do something...
}
function newBaseCreated () {
    // do something with empty base...
}
```

