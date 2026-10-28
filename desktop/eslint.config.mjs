import calypso, { nodeConfig } from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig(
	[
		...calypso( import.meta.dirname ),
		{ ...nodeConfig, files: [ 'bin/**', 'test/**' ] },
		{
			files: [ 'package.json' ],
			rules: {
				'@automattic/json/valid-values-name-scope': 'off',
				'@automattic/json/name-format': 'off',
			},
		},
	].map(
		// Directories below build on this config: keep its patterns relative to this directory.
		( entry ) => ( { basePath: import.meta.dirname, ...entry } )
	)
);
