import calypso from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{
		rules: {
			// This is a node.js project, it is ok to import node modules
			'import/no-nodejs-modules': 'off',
		},
	},
] );
