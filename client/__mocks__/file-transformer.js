const path = require( 'path' );

module.exports = {
	process( sourceText, sourcePath ) {
		return {
			code: `module.exports = ${ JSON.stringify( path.basename( sourcePath ) ) };`,
		};
	},
};
