/* eslint-disable import/no-extraneous-dependencies */
const jestConfig = require( '@automattic/calypso-build/jest.config.js' );

module.exports = { ...jestConfig, rootDir: __dirname };
