const path = require( 'path' );

const publicPath = path.resolve( path.join( __dirname, '..', '..', '..', 'public_desktop' ) );

module.exports = {
	getPath: function ( filename ) {
		return path.join( publicPath, filename );
	},
};
