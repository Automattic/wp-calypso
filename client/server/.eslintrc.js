const { rules: parentRules } = require( '../../.eslintrc.js' );

const newRestrictedImports = parentRules[ 'no-restricted-imports' ];
const filteredRestrictedPaths = newRestrictedImports[ 1 ].paths.filter(
	( path ) => 'object' !== typeof path || 'superagent' !== path.name
);

module.exports = {
	rules: {
		'no-restricted-imports': [
			newRestrictedImports[ 0 ],
			{
				paths: filteredRestrictedPaths,
			},
		],
	},
};
