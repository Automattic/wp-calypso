const { lodashRestrictedImports } = require( '@automattic/calypso-eslint-overrides' );

module.exports = {
	rules: {
		'no-restricted-imports': [
			'error',
			{
				paths: lodashRestrictedImports.paths,
				patterns: [
					{
						group: [ 'client/**/*', 'calypso/**/*' ],
						message: 'Calypso imports are not allowed in this package',
					},
					...lodashRestrictedImports.patterns,
				],
			},
		],
	},
};
