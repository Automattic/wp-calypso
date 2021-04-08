const path = require( 'path' );
const base = require( '@automattic/calypso-build/jest-preset' );

module.exports = {
	...base,
	cacheDirectory: path.join( __dirname, '../../.cache/jest' ),
	resolver: path.join( __dirname, '../../test/module-resolver.js' ),
	globals: {
		__i18n_text_domain__: 'default',
		// 'window.configData' is necessary for any tests of a package that uses
		// the calypso-config package; apparently 'globals' cannot be overriden in
		// jest config if using 'preset'.
		configData: {},
	},
};
