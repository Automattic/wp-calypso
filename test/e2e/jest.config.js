const baseConfig = require( '@automattic/calypso-e2e/src/jest-playwright-config' );

module.exports = {
	...baseConfig,
	cacheDirectory: '<rootDir>/../../.cache/jest',
	testMatch: [ '<rootDir>/specs/**/*.[jt]s' ],
	transform: {
		'\\.[jt]sx?$': [ 'babel-jest', { configFile: '../../babel.config.js' } ],
	},
};
