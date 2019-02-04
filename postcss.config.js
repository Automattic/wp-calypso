const path = require( 'path' );

module.exports = ( { options: { preserveCssCustomProperties = true } } ) => ( {
	plugins: {
		'postcss-custom-properties': {
			importFrom: [ path.join( __dirname, 'public', 'custom-properties.css' ) ],
			preserve: preserveCssCustomProperties,
		},
		autoprefixer: {},
	},
} );
