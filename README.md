# npm i -S fs-handy-wraps
Handy wraps for some Node.js FileSystem functions.  
A pretty simple library.


.


## Read and Write files
**check** (path, existCallback, absentCallback)
> Checks the file existence. All arguments are required.

**read** (path, successCallback[, errCallback])
> Reads the file contents.

**write** (path[, text, successCallback, errCallback])
> Rewrites the file content by `text` or an empty string. Also may be used for a new file creation.

**append** (path[, text, successCallback, errCallback])
> Appends `text` or an empty string to the end of the file.

**readOrMake** (path, readCallback, makeCallback[, newFileContent])
> Reads the file if it exists and calls readCallback then.  
> Creates a new file if a file specified by `path` does not exist and fills it by `newFileContent` if specified and executes `makeCallback` then.


.


## Read or Create a JSON config-file using simple CLI //CHANGED
**getConfig** (path, CLIQuestions, successCallback[, errCallback])
> Reads the `path` file, checks if for JSON errors and calls `successCallback(configContent)`.  
> Launches simple CLI according to `CLIQuestions` if `path` file does not exist.  
Example for `CLIQuestions` argument:  
```js
const CLIQuestions_EXAMPLE = [
    { prop: 'pathToBase',       question: 'Full path to database file:',        def: '/base.txt' },
    { prop: 'pathToNotefile',   question: 'Path to temp file:',                 def: '/note.txt' },
    { prop: 'editor',           question: 'Command to open your text editor:',  def: 'subl' },
];
```
The config-file will be created based on this example in case a user skips all questions:
```js
{
    "pathToBase": "/base.txt",
    "pathToNotefile": "/note.txt",
    "editor": "subl"
}
```
A callback `successCallback(configContent)` will be executed after the config creation finishes.

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
const cli = [
    { prop: 'base',   question: 'Where to store the database?',        def: '~/base.txt' },
    { prop: 'name',   question: 'What is the name of your Project?',   def: 'My new Project' },
];

function start() {
    FILE.getConfig(configPath, cli, checkBase);
}
function checkBase(config) {
    FILE.readOrMake(config.base, parseBase);
}
function parseBase(baseContent) {
    // do something with base content ...
}
```
