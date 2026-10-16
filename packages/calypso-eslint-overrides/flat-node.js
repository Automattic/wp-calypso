const globals = require( 'globals' );
const { rules } = require( './node' );

// Flat-config version of `./node`. Its `env: { node: true }` means Node globals and top-level `return`,
// which flat config gives CommonJS files; projects linting ES modules can override `sourceType`.
module.exports = {
	name: 'calypso/node',
	languageOptions: {
		sourceType: 'commonjs',
		globals: globals.node,
	},
	rules,
};
