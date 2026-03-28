const base = require( '../../test/packages/jest-preset' );

module.exports = {
	...base,
	testEnvironment: 'jsdom',
	testMatch: [ '<rootDir>/**/__tests__/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	moduleFileExtensions: [ 'ts', 'tsx', 'js', 'json' ],
};
