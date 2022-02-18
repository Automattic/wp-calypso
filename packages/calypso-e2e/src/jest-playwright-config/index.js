const path = require( 'path' );

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
	globalSetup: path.join( __dirname, 'global-setup.ts' ),
	runner: 'groups',
	setupFilesAfterEnv: [ path.join( __dirname, 'setup.ts' ) ],
	testEnvironment: path.join( __dirname, 'environment.ts' ),
	testRunner: 'jest-circus/runner',
	verbose: true,
};

module.exports = config;
