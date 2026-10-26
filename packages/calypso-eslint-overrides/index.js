const globals = require( 'globals' );

// For code that runs in Node.js, keeping the surrounding `sourceType`. Top-level `return` works where
// files are scripts or CommonJS, such as `.cjs` files.
module.exports.flatNodeConfig = {
	name: 'calypso/node',
	languageOptions: {
		globals: globals.node,
		// A fresh object per read: ESLint switches `globalReturn` off in place for ES modules.
		get parserOptions() {
			return { ecmaFeatures: { globalReturn: true } };
		},
	},
	rules: {
		'import/no-nodejs-modules': 'off',
		'no-console': 'off',
		'no-process-exit': 'off',
	},
};
