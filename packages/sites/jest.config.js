module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testMatch: [ '<rootDir>/tests/**/*.test.{ts,tsx}' ],
	testEnvironment: 'jsdom',
	globals: { window: { navigator: { userAgent: 'jest' } } },
};
