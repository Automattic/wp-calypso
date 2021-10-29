const { nodeConfig } = require( '@automattic/calypso-eslint-overrides' );

module.exports = {
	overrides: [
		{
			files: [ 'bin/**/*', 'test/**/*' ],
			...nodeConfig,
		},
	],
};
