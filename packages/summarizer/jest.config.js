module.exports = {
	preset: '../../test/packages/jest-preset.js',
	roots: [ '<rootDir>/src' ],
	testMatch: [ '<rootDir>/src/**/*.test.{js,ts,tsx}' ],
	testEnvironment: 'jsdom',
};
