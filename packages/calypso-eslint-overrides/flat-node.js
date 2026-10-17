const globals = require( 'globals' );
const { rules } = require( './node' );

// Flat-config version of `./node`, keeping the surrounding `sourceType` as its `env: { node: true }`
// did. Top-level `return` works where files are scripts or CommonJS, such as `.cjs` files.
module.exports = {
	name: 'calypso/node',
	languageOptions: {
		globals: globals.node,
		// A fresh object per read: ESLint switches `globalReturn` off in place for ES modules.
		get parserOptions() {
			return { ecmaFeatures: { globalReturn: true } };
		},
	},
	rules,
};
