module.exports = {
	preset: '@automattic/calypso-build',
	rootDir: __dirname,
	setupFiles: [ 'regenerator-runtime/runtime' ],
	cacheDirectory: '<rootDir>/../../.cache/jest',
};
