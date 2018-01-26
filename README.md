# npm i -S fs-handy-wraps
Handy wraps for some Node.js FileSystem functions.


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
getConfig (pathToConfig, CLIQuestions, successCallback, errCallback)
> description is coming soon...


## Watching on file changes
watch (path, callback)
> description is coming soon...


## Usage
```js
    soon
```
