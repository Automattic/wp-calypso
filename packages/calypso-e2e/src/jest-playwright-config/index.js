const path = require( 'path' );

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
	globalSetup: path.join( __dirname, 'global-setup.ts' ),
	runner: 'groups',
	testEnvironment: path.join( __dirname, 'environment.ts' ),
	testRunner: 'jest-circus/runner',
	testTimeout: process.env.PWDEBUG === '1' ? 5 * 60 * 1000 : 60 * 1000,
	verbose: true,
};

module.exports = config;
