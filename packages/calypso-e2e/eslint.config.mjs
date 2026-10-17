import { defineConfig } from 'eslint/config';
import root, { nodeConfig } from '../../eslint.config.mjs';

export default defineConfig( [
	...root,
	{
		...nodeConfig,
		name: 'calypso/calypso-e2e',
		rules: {
			...nodeConfig.rules,

			'jsdoc/require-jsdoc': [
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
	},
] );
