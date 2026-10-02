module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	testMatch: [ '<rootDir>/src/__tests__/*.[jt]s?(x)' ],
	moduleFileExtensions: [ 'ts', 'tsx', 'js', 'json' ],
};
