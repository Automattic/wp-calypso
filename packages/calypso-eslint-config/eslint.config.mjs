import path from 'node:path';
import calypso, { nodeConfig } from './index.mjs';

export default [
	...calypso,
	{
		...nodeConfig,
		rules: {
			...nodeConfig.rules,
			// The plugins are the repository root's devDependencies.
			'import/no-extraneous-dependencies': [
				'error',
				{ packageDir: [ import.meta.dirname, path.resolve( import.meta.dirname, '../..' ) ] },
			],
		},
	},
];
