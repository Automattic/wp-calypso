import calypso from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...calypso( import.meta.dirname ),
	{
		rules: {
			// This is a node.js project, it is ok to import node modules
			'import/no-nodejs-modules': 'off',
		},
	},
];

export default config;
