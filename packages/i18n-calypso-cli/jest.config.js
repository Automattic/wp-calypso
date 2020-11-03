module.exports = {
	preset: '@automattic/calypso-build',
	rootDir: __dirname,
	cacheDirectory: '<rootDir>/../../.cache/jest',
	resolver: '<rootDir>/../../test/module-resolver.js',
};
