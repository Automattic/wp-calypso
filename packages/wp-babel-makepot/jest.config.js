module.exports = {
	rootDir: __dirname,
	testMatch: [ '<rootDir>/**/test/*.[jt]s?(x)', '!**/.eslintrc.*', '!**/examples/**' ],
	cacheDirectory: '<rootDir>/../../.cache/jest',
	resolver: '<rootDir>/../../test/module-resolver.js',
};
