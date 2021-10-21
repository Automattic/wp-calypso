const { nodeConfig } = require( '@automattic/calypso-eslint-overrides' );

module.exports = {
	overrides: [
		{
			files: [ 'bin/**/*', 'e2e/**/*' ],
			...nodeConfig,
		},
	],
};
