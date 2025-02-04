const path = require( 'path' );

module.exports = {
	process( src, filename ) {
		return { code: 'module.exports = ' + JSON.stringify( path.basename( filename ) ) + ';' };
	},
};
