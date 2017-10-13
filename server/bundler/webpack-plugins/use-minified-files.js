/** @format */

/*
 * modifies the require.ensure calls in production to point to .min.js instead of .js extension
 */
function UseMinifiedFiles() {}

UseMinifiedFiles.prototype.apply = function( compiler ) {
	compiler.plugin( 'compilation', function( compilation ) {
		compilation.mainTemplate.plugin( 'require-ensure', function( source ) {
			const newSrc = source.toString().replace( '.js"', '.min.js"' );
			return this.asString( [ newSrc ] );
		} );
	} );
};

module.exports = UseMinifiedFiles;
