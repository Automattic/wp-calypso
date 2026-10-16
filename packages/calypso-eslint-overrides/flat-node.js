const globals = require( 'globals' );
const { rules } = require( './node' );

// Flat-config version of `./node`. Its `env: { node: true }` means Node globals and top-level `return`.
module.exports = {
	name: 'calypso/node',
	languageOptions: {
		globals: globals.node,
		parserOptions: { ecmaFeatures: { globalReturn: true } },
	},
	rules,
};
