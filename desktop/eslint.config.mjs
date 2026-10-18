import calypso, { nodeConfig } from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...calypso,
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
);

export default config;
