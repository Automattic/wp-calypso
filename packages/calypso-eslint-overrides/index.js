const globals = require( 'globals' );
const nodeConfig = require( './node' );

module.exports.nodeConfig = nodeConfig;

// Flat-config version of `nodeConfig`, keeping the surrounding `sourceType` as its `env: { node: true }`
// did. Top-level `return` works where files are scripts or CommonJS, such as `.cjs` files.
module.exports.flatNodeConfig = {
	name: 'calypso/node',
	languageOptions: {
		globals: globals.node,
		// A fresh object per read: ESLint switches `globalReturn` off in place for ES modules.
		get parserOptions() {
			return { ecmaFeatures: { globalReturn: true } };
		},
	},
	rules: nodeConfig.rules,
};
