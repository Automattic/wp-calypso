import { restrictedImports } from '@automattic/calypso-eslint-config';
import parent from '../eslint.config.mjs';

const [ severity, { paths, patterns } ] = restrictedImports;

/** @type {import('eslint').Linter.Config[]} */
const config = [
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
];

export default config;
