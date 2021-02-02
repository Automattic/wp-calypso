const path = require( 'path' );

if ( process.env.NODE_ENV !== 'development' ) {
	global.__public = path.resolve( __dirname ).replace( /\\/g, '\\\\' );
} else {
	global.__public = path.resolve( __dirname, '..', '..', '..' ).replace( /\\/g, '\\\\' );
}

const publicPath = path.resolve( global.__public, 'public_desktop' );

module.exports = {
	getPath: function ( filename ) {
		return path.join( publicPath, filename );
	},
};
