const baseConfig = require( './jest.config' );

module.exports = {
	...baseConfig,
	testMatch: [ '<rootDir>/specs/specs-playwright/**/*.gutenberg.*[jt]s' ],
};
