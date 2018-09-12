module.exports = Object.assign(
	{},
	{
		reporters: [
			'default',
			'jest-junit',
		],
		verbose: false,
	},
	require( './jest.config.json' )
);
