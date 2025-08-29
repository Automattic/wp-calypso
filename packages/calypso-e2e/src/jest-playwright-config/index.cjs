const path = require( 'path' );

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
	globalSetup: path.join( __dirname, 'global-setup.ts' ),
	runner: 'groups',
	testEnvironment: path.join( __dirname, 'environment.ts' ),
	testRunner: 'jest-circus/runner',
	testTimeout: process.env.PWDEBUG === '1' ? 10 * 60 * 1000 : 2 * 60 * 1000,
	verbose: true,
};

module.exports = config;
