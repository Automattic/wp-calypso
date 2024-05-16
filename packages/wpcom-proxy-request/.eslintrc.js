const nodeConfig = require( '@automattic/calypso-eslint-overrides/node' );

module.exports = {
	overrides: [
		{
			files: [ './test/**/*' ],
			...nodeConfig,
		},
	],
};
