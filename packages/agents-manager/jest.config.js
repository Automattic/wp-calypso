module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	testMatch: [ '<rootDir>/**/__tests__/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	moduleFileExtensions: [ 'ts', 'tsx', 'js', 'json' ],
	moduleNameMapper: {
		'\\.scss$': '<rootDir>/src/__mocks__/style-mock.js',
	},
};
