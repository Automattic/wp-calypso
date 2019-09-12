module.exports = {
	preset: '@automattic/calypso-build',
	// run tests for all packages that have a Jest config file
	projects: [ '<rootDir>/packages/*/jest.config.js' ],
	rootDir: './../../',
};
