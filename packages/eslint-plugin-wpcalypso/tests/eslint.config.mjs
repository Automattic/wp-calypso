import { defineConfig } from 'eslint/config';
import parent from '../eslint.config.mjs';

export default defineConfig( [
	...parent,
	{
		rules: {
			'max-len': 0,
		},
	},
] );
