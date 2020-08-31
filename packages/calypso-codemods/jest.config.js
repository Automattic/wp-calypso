module.exports = {
	preset: '@automattic/calypso-build',
	rootDir: __dirname,
	testMatch: [ '<rootDir>/tests/*/codemod.spec.js' ],
	setupFiles: [ '<rootDir>/setup-tests.js' ],
	cacheDirectory: '<rootDir>/../../.cache/jest',
};
