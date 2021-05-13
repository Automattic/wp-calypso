const path = require( 'path' );
const base = require( '@automattic/calypso-build/jest-preset' );

module.exports = {
	...base,
	cacheDirectory: path.join( __dirname, '../../.cache/jest' ),
	resolver: path.join( __dirname, '../../test/module-resolver.js' ),
	globals: {
		__i18n_text_domain__: 'default',
	},
};
