module.exports = Object.assign(
	{},
	{
		testResultsProcessor: './node_modules/jest-junit-reporter',
		verbose: false,
	},
	require( './jest.config' )
);
