const path = require( 'path' );

module.exports = {
	// Allow fetch api function usage (and similar)
	env: { browser: true },
	rules: {
		// We have lots of "fake" packages (directories with a package.json that don't declare dependencies),
		// we need to configure this rule to look into __dirname/node_modules, otherwise it will stop
		// looking up when it finds a package.json
		'import/no-extraneous-dependencies': [
			'error',
			{ packageDir: [ __dirname, path.join( __dirname, '..' ) ] },
		],
	},
	overrides: [
		{
			files: [ '**/test/**/*' ],
			rules: {
				'import/no-nodejs-modules': 'off',
			},
		},
	],
};
