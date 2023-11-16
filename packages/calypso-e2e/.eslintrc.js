const nodeConfig = require( '@automattic/calypso-eslint-overrides/node' );

module.exports = {
	...nodeConfig,
	rules: {
		...nodeConfig.rules,

		'require-jsdoc': [
			'error',
			{
				require: {
					FunctionDeclaration: true,
					MethodDefinition: true,
					ClassDeclaration: true,
					ArrowFunctionExpression: false,
					FunctionExpression: false,
				},
			},
		],
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_', ignoreRestSiblings: true },
		],
		'jsdoc/tag-lines': [ 'off' ],
	},
};
