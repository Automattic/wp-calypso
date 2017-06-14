/**
 * Internal dependencies
 */
const jestConfig = require( './jest.config' );

module.exports = Object.assign(
	{},
	{
		testResultsProcessor: './node_modules/jest-junit-reporter',
		verbose: false,
	},
	jestConfig
);
