/**
 *WARNING: No ES6 modules here. Not transpiled! ****
 */

const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );

module.exports = () => {
	return getBaseWebpackConfig(
		{
			WP: true,
		},
		{
			entry: {
				editor: './src/editor.js',
				view: './src/view.js',
			},
		}
	);
};
