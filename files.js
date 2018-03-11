const FS = require('fs');
const READLINE = require('readline');


function checkFileExistence(path, existCallback, absentCallback) {
    if (!path || !existCallback || !absentCallback) return console.error('files__checkFileExistence arguments ERROR: all arguments are required');
    FS.stat(path, (err) => {
        if (!err) {
            existCallback(path);  // ---------------------> exit (file exists)
        }
        else if (err && err.code == 'ENOENT') {
            absentCallback(path);  // ---------------------> exit (file does not exist)
        }
    });
}
function readFile(path, successCallback, errCallback) {
    if (!path || !successCallback) 
        return console.error('files__readFile arguments ERROR: "path" and "successCallback" are required');

    FS.readFile (path, 'utf8', (err, content) => {
        if (err) {
            errCallback ? errCallback() : console.error ('files__readFile ERROR: ', err);  // ---> exit (unable to read file)
        } else {
            successCallback(content);  // -----------------------> exit (file content goes outside)
        }
    });
}
function makeDir(path, successCallback, errCallback) {
    if (!path || !successCallback) 
        return console.error('files__makeDir arguments ERROR: "path" and "successCallback" are required');

    FS.mkdir (path, 0777, err => {
        if (err) {
            if (err.code == 'EEXIST') successCallback(); // the folder already exists
            else errCallback && errCallback(err);        // something went wrong
        } else successCallback();   // successfully created folder
    });
}
function writeFile(path, text, successCallback, errCallback) {
    if (!path) return console.error('files__writeFile arguments ERROR: "path" is required');

    const content = text || '';
    FS.writeFile(path, content, (err) => {
        if (err) {
            console.error('files__writeFile ERROR: ', err);
            errCallback ? errCallback() : console.error ('files__writeFile ERROR: ', err)  // ---> exit (unable to write a file)
        }
        else {
            successCallback && successCallback();  // ----------------> exit (file is successfully rewritten or made)
        }
    });
}
function appendToFile(path, text, successCallback, errCallback) {
    if (!path) return console.error('files__append arguments ERROR: "path" is required');

    const content = text || '';
    FS.appendFile(
        path,
        content,
        (err) => {
            if (err) {
                errCallback ? errCallback() : console.error('files__append ERROR:', err);  // ---> exit (unable to append)
            } else {
                successCallback && successCallback();  // ---------------------> exit (file is successfully appended)
            }
        }
    )
}
function readOrMake(path, readCallback, makeCallback, newFileContent, errCallback) {
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
    'check': checkFileExistence,
    'read': readFile,
    'makeDir': makeDir,
    'write': writeFile,
    'append': appendToFile,
    'readOrMake': readOrMake,
    'watch': detectFileChanges,
    'getConfig': getConfig,
}
