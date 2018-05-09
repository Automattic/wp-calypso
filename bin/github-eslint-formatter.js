/** @format */

const path = require( 'path' );

module.exports = function( results ) {
	results.filter( result => result.errorCount + result.warningCount ).forEach( result => {
		const relativePath = path.relative( path.resolve( __dirname, '..' ), result.filePath );
		console.log(
			`- [ ] ${ relativePath } (${ result.errorCount } err, ${ result.warningCount } warn)`
		);
	} );
};
