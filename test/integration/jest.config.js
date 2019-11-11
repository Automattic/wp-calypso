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
		'<rootDir>/bin/**/integration/*.[jt]s',
		'<rootDir>/client/**/integration/*.[jt]s',
		'<rootDir>/server/**/integration/*.[jt]s',
		'<rootDir>/test/test/helpers/**/integration/*.[jt]s',
		'!**/.eslintrc.*',
	],
	verbose: false,
};
