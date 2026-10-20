import { restrictedImports } from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';
import parent from '../eslint.config.mjs';

const [ severity, { paths, patterns } ] = restrictedImports;

export default defineConfig( [
	...parent,
	{
		rules: {
			// The server can use `superagent`.
			'no-restricted-imports': [
				severity,
				{ paths: paths.filter( ( { name } ) => name !== 'superagent' ), patterns },
			],
		},
	},
] );
