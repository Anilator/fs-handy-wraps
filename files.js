const FS = require('fs');
const FSE = require('fs-extra'); // Temp foreign dependency
const READLINE = require('readline');

function check(fn) { // all fs-handy functions have the required first argument
  return (...args) => {
    if (!args[0]) throw new Error('fs-handy: first argument is required');
    else return fn.apply(this, args);
  };
}


// PROMISIFIED FUNCTIONS
function checkFileExistence(path, existCallback, absentCallback) {
  if (existCallback) {
    if (!absentCallback) throw new Error('fs-handy: all arguments are required');
    else {
      slave(existCallback, absentCallback);
      return this;
    }
  } else {
    return new Promise(slave);
  }

  function slave(resolve, reject) {
    FS.stat(path, (err) => {
      if (!err) resolve(path); // ------------------------> exit (file exists)
      else if (err.code === 'ENOENT') reject(path); // ---> exit (file does not exist)
      else throw err;
    });
  }
}
function readFile(path, successCallback, errCallback) {
  if (successCallback) {
    slave(successCallback, errCallback);
    return this;
  }
  return new Promise(slave);


  function slave(resolve, reject) {
    FS.readFile(path, 'utf8', (err, data) => {
      if (err) {
        return reject && reject(err); // ---> exit (unable to read file)
      }
      return resolve(data);  // ------------> exit (file data goes outside)
    });
  }
}
function writeFile(path, text, successCallback, errCallback) {
  const data = text || '';

  if (successCallback) {
    slave(successCallback, errCallback);
    return this;
  }
  return new Promise(slave);


  function slave(resolve, reject) {
    FS.writeFile(path, data, (err) => {
      if (err) {
        err.message = `fs-handy: unable to write file "${path}"`;
        return reject && reject(err); // ---> exit (unable to write file)
      }
      return resolve(data); // ----> exit (file is successfully written)
    });
  }
}
function appendToFile(path, text, successCallback, errCallback) {
  const data = text || '';

  if (successCallback) {
    slave(successCallback, errCallback);
    return this;
  }
  return new Promise(slave);


  function slave(resolve, reject) {
    FS.appendFile(path, data, (err) => {
      if (err) {
        err.message = `fs-handy: unable to append file "${path}"`;
        return reject && reject(err); // ----> exit (unable to append file)
      }
      return resolve && resolve(data); // ---> exit (file is successfully appended)
    });
  }
}
function readOrMakeFile(path, makeFunctionOrString, successCallback, errCallback) {
  const makeCallback = typeof makeFunctionOrString === 'function'
    ? makeFunctionOrString
    : resolve => resolve('');

  if (successCallback) {
    slave(successCallback, errCallback);
    return this;
  }
  return new Promise(slave);


  function slave(resolve, reject) {
    checkFileExistence(
      path,
      // ---> exit (file is exist and will be read)
      () => readFile(path, resolve, reject),
      // ---> makeCallback will return the content
      () => makeCallback(writeCallback, reject)
    );

    function writeCallback(content) {
      writeFile(
        path,
        content,
        resolve, // ---> exit (new file is created with the content provided by makeCallback)
        reject // ---> exit (something went wrong)
      );
    }
  }
}
function makeDirectories(path, successCallback, errCallback) {
  if (successCallback) {
    slave(successCallback, errCallback);
    return this;
  }
  return new Promise(slave);


  function slave(resolve, reject) {
    FSE.ensureDir(path, (err) => {
      if (err) {
        if (reject) reject(err);
        else throw new Error(`fs-handy: unable to make a directory "${path}"`);
      } else {
        resolve(path);
      }
    });
  }
}

function getConfig(path, defaultValues, CLIQuestions, successCallback, errCallback) {
  /*
  const CLIQuestions_EXAMPLE = [
    { prop: 'pathToBase',       question: 'Full path to database file:' },
    { prop: 'pathToNotefile',   question: 'Path to temp file:' },
    { prop: 'editor',           question: 'Command to open your text editor:' },
  ];
  */
  const defaults = defaultValues || {};
  const CLIAnswers = {};

  if (successCallback) {
    slave(successCallback, errCallback);
    return this;
  }
  return new Promise(slave);

  function slave(resolve, reject) {
    readOrMakeFile(
      path,
      checkConfigReadability,
      createConfig,
      reject
    );

    function checkConfigReadability(content) {
      try {
        const parsedConfig = JSON.parse(content);
        process.nextTick(() => resolve(parsedConfig)); // ---------> exit
      } catch (err) {
        // What to do with the broken Config?
        if (reject) reject(err); // -------> exit with error (incorrect JSON)
        else throw new Error('fs-handy: config-file contains incorrect JSON');
      }
    }
    function createConfig() {
      if (CLIQuestions) ask();
      else assignDefaults({});

      function ask() {
        const rl = READLINE.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        let currentLine = CLIQuestions.shift();


        rl.question(`${currentLine.question} \n`, answerCallback);


        function answerCallback(answer) {
          if (answer) CLIAnswers[currentLine.prop] = answer; // Results

          if (CLIQuestions.length) {
            currentLine = CLIQuestions.shift();
            rl.question(`${currentLine.question} \n`, answerCallback);
          } else {
            rl.close();
            assignDefaults(CLIAnswers); // CLI finish
          }
        }
      }
      function assignDefaults(CLIanswers) {
        const configResult = Object.assign(defaults, CLIanswers);
        writeConfigFile(configResult);
      }
      function writeConfigFile(config) {
        writeFile(
          path,
          JSON.stringify(config, null, 2),
          resolve  // ------------------> exit (new config goes outside)
        );
      }
    }
  }
}

// NOT PROMISIFIED
function detectFileChanges(path, callback) {
  if (!callback) throw new Error('fs-handy: "callback" is required');

  let timer;
  FS.watch(path, () => {
    if ((timer) && (!timer._called)) return; // Removes duplicated fire (FS.watch bug)
    timer = setTimeout(callback, 30); // ---> exit (file was changed -> 30ms -> callback execution)
  });
}

module.exports = {
  check:      check(checkFileExistence),
  read:       check(readFile),
  write:      check(writeFile),
  append:     check(appendToFile),
  rom:        check(readOrMakeFile),
  dir:        check(makeDirectories),

  watch:      check(detectFileChanges),
  getConfig:  check(getConfig),
};
