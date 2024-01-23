const { nodeConfig } = require( '@automattic/calypso-eslint-overrides' );

module.exports = {
	env: {
		browser: true,
	},
	overrides: [
		{
			files: [ './bin/**/*', './webpack.config.js' ],
			...nodeConfig,
		},
	],
	rules: {
		'no-restricted-imports': [
			0,
			{
				paths: [
					{
						name: 'redux',
						importNames: [ 'combineReducers' ],
					},
				],
			},
		],
	},
};
