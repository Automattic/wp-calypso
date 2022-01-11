const path = require( 'path' );

module.exports = {
	setupFilesAfterEnv: [
		path.join( __dirname, 'jest-environment-playwright/setup-files-after-env.js' ),
	],
	globalSetup: path.join( __dirname, 'jest-environment-playwright/global-setup.ts' ),
	verbose: true,
	runner: 'groups', // This is for jest-runner-groups. It works with jest-circus below!
	testRunner: 'jest-circus/runner',
	testEnvironment: path.join( __dirname, 'jest-environment-playwright/index.ts' ),
};
