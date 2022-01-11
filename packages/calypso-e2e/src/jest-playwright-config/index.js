const path = require( 'path' );

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
	setupFilesAfterEnv: [ path.join( __dirname, 'setup-files-after-env.js' ) ],
	globalSetup: path.join( __dirname, 'global-setup.ts' ),
	verbose: true,
	runner: 'groups', // This is for jest-runner-groups. It works with jest-circus below!
	testRunner: 'jest-circus/runner',
	testEnvironment: path.join( __dirname, 'test-environment.ts' ),
};

module.exports = config;
