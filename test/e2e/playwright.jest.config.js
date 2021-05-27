module.exports = {
	name: 'playwright-e2e',
	displayName: 'playwright-e2e',
	cacheDirectory: '<rootDir>/../../.cache/jest',
	verbose: true,
	transform: {
		'\\.[jt]sx?$': [ 'babel-jest', { configFile: '../../babel.config.js' } ],
	},
	testMatch: [ '<rootDir>/specs/specs-playwright/**/*.js' ],
	setupFilesAfterEnv: [ '<rootDir>/lib/hooks-playwright/jest.ts' ],
	// preset: 'jest-playwright-preset',
};
