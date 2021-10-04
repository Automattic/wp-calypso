const nodeConfig = require( '@automattic/calypso-build/eslint/node' );

module.exports = {
	overrides: [
		{
			files: [ 'bin/**/*', 'e2e/**/*' ],
			...nodeConfig,
		},
	],
};
