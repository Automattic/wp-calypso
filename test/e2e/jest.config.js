const baseConfig = require( '@automattic/calypso-e2e/src/jest-playwright-config' );

module.exports = {
	...baseConfig,
	cacheDirectory: '<rootDir>/../../.cache/jest',
	testMatch: [ '<rootDir>/specs/**/*.[jt]s' ],
	testPathIgnorePatterns: [ '\\.spec\\.ts$' ], // Exclude Playwright Test spec files ending in `.spec.ts`
	transform: {
		'\\.[jt]sx?$': [ 'babel-jest', { configFile: '../../babel.config.js' } ],
	},
};
