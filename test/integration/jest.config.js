module.exports = {
	moduleNameMapper: {
		'^config$': '<rootDir>/client/server/config/index.js',
	},
	modulePaths: [ '<rootDir>/test', '<rootDir>/client', '<rootDir>/client/extensions' ],
	rootDir: '../..',
	testEnvironment: 'node',
	testMatch: [
		'<rootDir>/bin/**/integration/*.[jt]s',
		'<rootDir>/client/**/integration/*.[jt]s',
		'<rootDir>/test/test/helpers/**/integration/*.[jt]s',
		'!**/.eslintrc.*',
	],
	verbose: false,
};
