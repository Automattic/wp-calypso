const path = require( 'path' );
const base = require( '@automattic/calypso-jest' );

module.exports = {
	...base,
	cacheDirectory: path.join( __dirname, '../../.cache/jest' ),
	resolver: require.resolve( '@automattic/calypso-jest/src/module-resolver.js' ),
	globals: {
		__i18n_text_domain__: 'default',
	},
};
