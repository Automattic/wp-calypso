module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	testMatch: [
		'<rootDir>/**/__tests__/*.[jt]s?(x)',
		'<rootDir>/**/test/*.[jt]s?(x)',
		'!**/.eslintrc.*',
	],
	moduleFileExtensions: [ 'ts', 'tsx', 'js', 'json' ],
};
