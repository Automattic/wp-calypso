/** @format */

module.exports = {
	modulePaths: [
		'<rootDir>/test/',
		'<rootDir>/server/',
		'<rootDir>/client/',
		'<rootDir>/client/extensions/',
	],
	rootDir: './../../',
	testEnvironment: 'node',
	testMatch: [
		'<rootDir>/bin/**/integration/*.js',
		'<rootDir>/client/**/integration/*.js',
		'<rootDir>/server/**/integration/*.js',
		'<rootDir>/test/test/helpers/**/integration/*.js',
		'!**/.eslintrc.*',
	],
	verbose: false,
};
