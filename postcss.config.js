const path = require( 'path' );

module.exports = ( { options: { preserveCssCustomProperties = true } } ) => ( {
	plugins: {
		'postcss-custom-properties': {
			importFrom: [
				path.join(
					__dirname,
					'node_modules',
					'@automattic',
					'calypso-shared-style',
					'dist',
					'custom-properties.css'
				),
			],
			preserve: preserveCssCustomProperties,
		},
		autoprefixer: {},
	},
} );
