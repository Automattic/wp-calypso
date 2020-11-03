module.exports = {
	preset: '@automattic/calypso-build',
	rootDir: __dirname,
	// Node project, no need to transform anything
	transformIgnorePatterns: [ '<rootDir>/', '/node_modules/' ],
	cacheDirectory: '<rootDir>/../../.cache/jest',
	resolver: '<rootDir>/../../test/module-resolver.js',
};
