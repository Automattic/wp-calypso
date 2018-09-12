module.exports = Object.assign(
	{},
	{
		testResultsProcessor: 'jest-junit',
		verbose: false,
	},
	require( './jest.config.json' )
);
