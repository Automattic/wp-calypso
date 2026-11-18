import calypso, { browserGlobals } from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{
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
	{
		files: [ 'test/**' ],
		rules: {
			// These files use a weird mixture of CJS and ESM. Disabling the rules for now until they can
			// get refactored.
			'import/default': 'off',
		},
	},
] );
