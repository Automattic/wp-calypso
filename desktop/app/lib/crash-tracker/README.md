# Crash Tracker

A general crash tracking library that can be passed data to store on a remote crash tracking server.

The tracker is only enabled when `crash_reporter` is defined in the config. This is then used as remote URL to POST a JSON object.

The following additional details are always logged:

- `platform` - value from `process.platform`
- `release` - value from `os.release()``
- `version` - version value from `package.json`
- `build` - build value from `config.json`
- `time` - current time, in microseconds

## Functions

`crash.track( errorType, errorData, cb )`

Where:

- `errorType` - a crash group identifier
- `errorData` - Any JS object or value to be stored in the crash log
- `cb` - Called when the crash been recorded. If you intend to quit the app then use this to ensure the crash is recorded before the app quits

## Example

`crash.track( 'exception', { code: errorCode, message: errorMessage } )`
