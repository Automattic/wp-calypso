module.exports = {
	moduleNameMapper: {
		'^@automattic/calypso-config$': '<rootDir>/client/server/config/index.js',
	},
	modulePaths: [ '<rootDir>/client/extensions' ],
	rootDir: '../..',
	testEnvironment: 'node',
	resolver: '<rootDir>/test/module-resolver.js',
	testMatch: [
		'<rootDir>/bin/**/integration/*.[jt]s',
		'<rootDir>/client/**/integration/*.[jt]s',
		'<rootDir>/test/test/helpers/**/integration/*.[jt]s',
		'!**/.eslintrc.*',
	],
	verbose: false,
};
