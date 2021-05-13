const path = require( 'path' );

let pathStub;
if ( process.env.NODE_ENV !== 'development' ) {
	pathStub = path.resolve( __dirname ).replace( /\\/g, '\\\\' );
} else {
	pathStub = path.resolve( __dirname, '..', '..', '..' ).replace( /\\/g, '\\\\' );
}

const publicPath = path.resolve( pathStub, 'public_desktop' );

module.exports = {
	getPath: function ( filename ) {
		return path.join( publicPath, filename );
	},
};
