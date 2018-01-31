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

**readOrMake** (path, readCallback[, makeCallback])
> Reads the file if it exists.
> Creates a new empty file if a file specified by `path` does not exist and `makeCallback` is not specified.
> Executes `makeCallback` if the file does not exist and `makeCallback` is specified.



.


## Create a JSON config-file using simple CLI
**getConfig** (pathToConfig, CLIQuestions, successCallback, errCallback)
> Reads the `pathToConfig` file, checks if for JSON errors and calls `successCallback(configContent)`.
> Launches simple CLI according to `CLIQuestions` if `pathToConfig` file does not exist.
Example for `CLIQuestions` argument:
```js
const CLIQuestions_EXAMPLE = [
    { prop: 'pathToBase',       question: 'Full path to database file:',        def: '/base.txt' },
    { prop: 'pathToNotefile',   question: 'Path to temp file:',                 def: '/note.txt' },
    { prop: 'editor',           question: 'Command to open your text editor:',  def: 'subl' },
];
```
The config-file will be created based on this example in case user skips all questions:
```js
{
	"pathToBase": "/base.txt",
	"pathToNotefile": "/note.txt",
	"editor": "subl"
}
```
After the config creation finishes, a callback `successCallback(configContent)` will be executed.


## Watching on file changes
**watch** (path, callback)
> Creates a Watcher that will call the `callback` every time file `path` is changed.
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
