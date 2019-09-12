const { defaults } = require( 'jest-config' );

module.exports = {
	preset: '@automattic/calypso-build',
	// run tests for all packages that have a Jest config file
	projects: [ '<rootDir>/packages/*/jest.config.js' ],
	rootDir: './../../',
	testPathIgnorePatterns: [ ...defaults.testPathIgnorePatterns, '/^<rootDir>/packages/dist//' ],
};
