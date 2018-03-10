const FS = require('fs');


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
    if (!path || !successCallback) return console.error('files__readFile arguments ERROR: "path" and "successCallback" are required');

    FS.readFile(path, 'utf8', (err, content) => {
        if (err) {
            console.error('files__readFile ERROR: ', err);
            errCallback || errCallback();  // ---------------------> exit (unable to read file)
        } else {
            successCallback(content);  // ---------------------> exit (file content goes outside)
        }
    });
}
function writeFile(path, text, successCallback, errCallback) {
    if (!path) return console.error('files__writeFile arguments ERROR: "path" is required');

    const content = text || '';
    FS.writeFile(path, content, (err) => {
        if (err) {
            console.error('files__writeFile ERROR: ', err);
            errCallback || errCallback();  // ---------------------> exit (unable to write a file)
        }
        else {
            successCallback && successCallback();  // ---------------------> exit (file is successfully rewritten or made)
        }
    })
}
function appendToFile(path, text, successCallback, errCallback) {
    if (!path) return console.error('files__append arguments ERROR: "path" is required');

    const content = text || '';
    FS.appendFile(
        path,
        content,
        (err) => {
            if (err) {
                errCallback ? errCallback() : console.error('files__append ERROR:', err);  // ---------------------> exit (unable to append)
            } else {
                successCallback && successCallback();  // ---------------------> exit (file is successfully appended)
            }
        }
    )
}
function readOrMake(path, readCallback, makeCallback, newFileContent) {
    if (!path || !readCallback || !makeCallback) 
        return console.error('files__readOrMake arguments ERROR: "path", "readCallback" and "makeCallback" are required');

    let content = newFileContent || '';

    checkFileExistence (
        path,
        () => readFile (path, readCallback),  // ------------------> exit (file is exist and will be read)
        () => makeNewFile () // -----------------------------------> exit (new file will be made by makeCallback)
    );


    function makeNewFile () {
        writeFile (
            path,
            content,
            () => makeCallback (path, content)  // ---------------> exit (new file created)
        );
    }
}
function watchFileChanges(path, callback) {
    if (!path || !callback) return console.error('files__watchFileChanges arguments ERROR: "path" and "callback" are required');

    let timer;

    FS.watch(path, () => {
        if ((timer) && (!timer._called)) return; // Removes duplicated fire (FS.watch bug)

        timer = setTimeout(callback, 30);  // ---------------------> exit ( file was changed -> 30ms -> callback execution )
    });
}
function getConfig(path, CLIQuestions, successCallback, errCallback) {
    if (!path || !CLIQuestions || !successCallback) 
        return console.error('files__getConfig arguments ERROR: "path", "CLIQuestions" and "successCallback" are required');

    /*
    const CLIQuestions_EXAMPLE = [
        { prop: 'pathToBase',       question: 'Full path to database file:',        def: '/base.txt' },
        { prop: 'pathToNotefile',   question: 'Path to temp file:',                 def: '/note.txt' },
        { prop: 'editor',           question: 'Command to open your text editor:',  def: 'subl' },
    ];
    */

    const CLIAnswers = {};
    let currentLine = CLIQuestions.shift();


    checkFileExistence (
        path,
        () => readFile (path, checkConfigReadability),
        createConfig
    );


    function checkConfigReadability(content) {
        try {
            const parsedConfig = JSON.parse (content);
            process.nextTick (
                () => successCallback (parsedConfig)  // ---------------------> exit (parsed config goes outside)
            );
        } catch (e) {
            console.error('files__getConfig ERROR: config-file contains non correct JSON\n', e);

            // What to do with broken Config?
        }
    }
    function createConfig(){
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });


        rl.question(currentLine.question + '\n', ask);


        function ask(answer) {
            CLIAnswers[currentLine.prop] = answer ? answer : currentLine.def;   // Results

            if (CLIQuestions.length) {
                currentLine = CLIQuestions.shift();
                rl.question(currentLine.question + '\n', ask);
            } else {
                rl.close();
                const configContent = JSON.stringify(CLIAnswers);

                writeFile(
                    path,
                    configContent,
                    () => successCallback (CLIAnswers)  // ---------------------> exit (new config data goes outside)
                );
            }
        }
    }
}


module.exports = {
    'check': checkFileExistence,
    'read': readFile,
    'write': writeFile,
    'append': appendToFile,
    'readOrMake': readOrMake,
    'watch': watchFileChanges,
    'getConfig': getConfig,
}
