/** @format */
var fs = require( 'fs' );

function replaceLine( file ) {
	fs.readFile( file, 'utf8', function( err, data ) {
		if ( err ) {
			return console.log( err );
		}
		var result = data.replace(
			/import PropTypes from 'prop-types';\n\n(?=import)/g,
			"import PropTypes from 'prop-types';\n"
		);

		fs.writeFile( file, result, 'utf8', function( err ) {
			if ( err ) return console.log( err );
		} );
	} );
}

replaceLine( process.argv[ 2 ] );
