/*
 * AUTOGENERATED FROM GENERATE-SERVICE-WORKER
 * Injected global: $DEBUG
 */

function print(fn) {
  return function() {
    if ($DEBUG) {
      console[fn].apply(console, args);
    }
  }
}

const logger = {
  log: print('log'),
  warn: print('warn'),
  error: print('error'),
};
