## Testing configuration

At the moment we maintain three different group of tests. You can find configurations for all of them in the following subfolders:
* `client` - unit and component tests for code located in `client` folder.
* `integration` - integration tests for code located in `bin`, `client` and `server` folders.
* `server` - unit tests for code located in `server` folder.

Check [testing documentation](https://github.com/Automattic/wp-calypso/blob/master/docs/testing.md) to learn more how all those test configurations are consumed by [Jest](https://facebook.github.io/jest/) testing platform to ensure proper code quality of Calypso codebase.

## Test helpers

This folder contains also legacy test helpers which were used with the previous testing tool called [Mocha](https://mochajs.org/). They are still used in many places, but should be considered as **deprecated**. Check the corresponding code comments to learn about valid alternatives.
