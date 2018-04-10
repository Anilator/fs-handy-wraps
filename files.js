const FS = require('fs');
const READLINE = require('readline');

function check (fn) { // all fs-handy functions have the required first argument
    return function () {
        if (!arguments[0]) throw 'fs-handy: argument "path" is required';
        else return fn.apply (this, arguments);
    };
}


// PROMISIFIED FUNCTIONS
function checkFileExistence (path, existCallback, absentCallback) {
    if (existCallback) {
        if (!absentCallback)
            throw `fs-handy: all arguments are required`;
        else {
            check (existCallback, absentCallback);
            return this;
        }
    } else {
        return new Promise (check);
    }

    function check (resolve, reject) {
        FS.stat (path, (err) => {
            if (!err) resolve (path);  // ----------------------> exit (file exists)
            else {
                if (err.code == 'ENOENT') reject (path);  // ---> exit (file does not exist)
                else throw err;
            }
        });
    }
}
function makeDirectory (path, successCallback, errCallback) {
    if (successCallback) {
        mkd (successCallback);
        return this;
    } else {
        return new Promise (mkd);
    }


    function mkd (resolve, reject) {
        FS.mkdir (path, 0777, err => {
            if (err) {
                if (err.code == 'EEXIST') resolve (path);  // --------> exit (the folder already exists)
                else {
                    if (errCallback) return errCallback (err);  // ---> exit (something went wrong)
                    if (reject) return reject (err);
                    else throw new Error (`fs-handy: unable to make a directory "${path}"`);
                }
            } else {
                resolve (path);   // successfully created folder
            }
        });
    }
}
function readFile (path, successCallback, errCallback) {
    if (successCallback) {
        read (successCallback);
        return this;
    } else
        return new Promise (read);


    function read (resolve, reject) {
        FS.readFile (path, 'utf8', (err, data) => {
            if (err) {
                if (errCallback) return errCallback (err);  // ---> exit (unable to read file)
                if (reject) return reject (err);
                if (err.code === 'ENOENT')
                    throw new Error (`fs-handy: file "${path}" not found`);
                else throw err;
            } else {
                resolve (data);  // ------------------------------> exit (file data goes outside)
            }
        });
    }
}
function writeFile (path, text, successCallback, errCallback) {
    const data = text || '';

    if (successCallback || errCallback) {
        write (successCallback);
        return this;
    } else
        return new Promise (write);


    function write (resolve, reject) {
        FS.writeFile (path, data, (err) => {
            if (err) {
                if (errCallback) return errCallback (err);  // ---> exit (unable to write file)
                if (reject) return reject (err);
                throw new Error (`fs-handy: unable to write file "${path}"`);
            }
            else {
                resolve && resolve ({ path, data });  // ---------> exit (file is successfully written)
            }
        });
    }
}
function appendToFile (path, text, successCallback, errCallback) {
    const data = text || '';

    if (successCallback || errCallback) {
        append (successCallback);
        return this;
    } else
        return new Promise (append);


    function append (resolve, reject) {
        FS.appendFile (
            path,
            data,
            err => {
                if (err) {
                    if (errCallback) return errCallback (err);  // ---> exit (unable to append file)
                    if (reject) return reject (err);
                    throw new Error (`fs-handy: unable to append file "${path}"`);
                } else {
                    resolve && resolve ({ path, data });  // ---------> exit (file is successfully appended)
                }
            }
        )
    }
}

// NOT PROMISIFIED FUNCTIONS
function readOrMakeFile(path, readCallback, makeCallback, newFileContent, errCallback) {
    if (!path || !readCallback || !makeCallback)
    return console.error('files__readOrMake arguments ERROR: "path", "readCallback" and "makeCallback" are required');

    let content = newFileContent || '';

    checkFileExistence (
        path,
        () => readFile (path, readCallback, errCallback),  // -----> exit (file is exist and will be read)
        () => makeNewFile () // -----------------------------------> exit (new file will be made by makeCallback)
    );


    function makeNewFile () {
        writeFile (
            path,
            content,
            () => makeCallback (path, content),  // ---------------> exit (new file created)
            errCallback
        );
    }
}
function detectFileChanges(path, callback) {
    if (!path || !callback)
        return console.error ('files__detectFileChanges arguments ERROR: "path" and "callback" are required');

    let timer;

    FS.watch (path, () => {
        if ((timer) && (!timer._called)) return; // Removes duplicated fire (FS.watch bug)

        timer = setTimeout (callback, 30);  // -------> exit ( file was changed -> 30ms -> callback execution )
    });
}
function getConfig(path, successCallback, defaultValues, CLIQuestions, errCallback) {
    if (!path || !successCallback)
        return console.error('files__getConfig arguments ERROR: "path" and "successCallback" are required');
    /*
    const CLIQuestions_EXAMPLE = [
        { prop: 'pathToBase',       question: 'Full path to database file:' },
        { prop: 'pathToNotefile',   question: 'Path to temp file:' },
        { prop: 'editor',           question: 'Command to open your text editor:' },
    ];
    */
    const defaults = defaultValues || {};
    const CLIAnswers = {};


    checkFileExistence (
        path,
        () => readFile (path, checkConfigReadability),
        createConfig
    );


    function checkConfigReadability (content) {
        try {
            const parsedConfig = JSON.parse (content);
            process.nextTick (
                () => successCallback (parsedConfig)  // -------------> exit (parsed config goes outside)
            );
        } catch (err) {
            // What to do with the broken Config?
            errCallback ?
                errCallback(err) :
                console.error ('files__getConfig ERROR: config-file contains non correct JSON\n', err);
        }
    }
    function createConfig () {
        if (CLIQuestions)
            ask (CLIQuestions)
        else
            assignDefaults ({});

        function ask (questions) {
            const rl = READLINE.createInterface ({
                input: process.stdin,
                output: process.stdout,
            });
            let currentLine = CLIQuestions.shift();


            rl.question (currentLine.question + '\n', answerCallback);


            function answerCallback (answer) {
                if (answer) CLIAnswers[currentLine.prop] = answer; // Results

                if (CLIQuestions.length) {
                    currentLine = CLIQuestions.shift();
                    rl.question (currentLine.question + '\n', answerCallback);
                } else {
                    rl.close ();
                    assignDefaults (CLIAnswers); // CLI finish
                }
            }
        }
        function assignDefaults (CLIanswers) {
            const configResult = Object.assign (defaults, CLIanswers);

            writeConfigFile (configResult);
        }
        function writeConfigFile (config) {
            writeFile (
                path,
                JSON.stringify (config, null, 2),
                () => successCallback (config)  // ---------------------> exit (new config goes outside)
            );
        }
    }
}


module.exports = {
    'check':      check (checkFileExistence),
    'read':       check (readFile),
    'makeDir':    check (makeDirectory),
    'write':      check (writeFile),
    'append':     check (appendToFile),
    'readOrMake': check (readOrMakeFile),
    'watch':      check (detectFileChanges),
    'getConfig':  check (getConfig),
}
