import { defineConfig } from 'eslint/config';
import root, { browserGlobals, nodeConfig } from '../../eslint.config.mjs';

export default defineConfig( [
	...root,
	{
		name: 'calypso/wpcom.js',
		languageOptions: { globals: browserGlobals },
		rules: {
			'jsdoc/no-undefined-types': [
				'error',
				{
					definedTypes: [ 'WPCOM' ],
				},
			],
		},
	},
	{ ...nodeConfig, files: [ 'examples/server/**', 'examples/node/**' ] },
	{
		files: [ 'examples/**/package.json' ],
		rules: {
			'@automattic/json/require-repository-directory': 'off',
			'@automattic/json/require-license': 'off',
			'@automattic/json/valid-values-name-scope': 'off',
			'@automattic/json/description-format': 'off',
			'@automattic/json/valid-values-author': 'off',
		},
	},
	{
		files: [ 'test/**' ],
		rules: {
			// These files use a weird mixture of CJS and ESM. Disabling the rules for now until they can
			// get refactored.
			'import/default': 'off',
		},
	},
] );
