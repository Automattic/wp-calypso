const config = require( './server/config' );
const bundleEnv = config( 'env' );

if ( bundleEnv === 'development' ) {
	module.exports = () => ( {
		plugins: {
			autoprefixer: {},
		},
	} );
} else {
	module.exports = () => ( {
		plugins: {
			'postcss-custom-properties': {
				importFrom: [ require.resolve( '@automattic/calypso-color-schemes' ) ],
			},
			autoprefixer: {},
		},
	} );
}
