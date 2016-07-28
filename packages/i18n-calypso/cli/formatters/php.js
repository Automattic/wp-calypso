
/**
 * Determine the correct GlotPress i18n function to use based on the input:
 * __(), _n(), _nx(), _x()
 * @param  {object} properties - properties describing translation request
 * @return {string}            returns the function name
 */
function getGlotPressFunction( properties ) {
	var wpFunc = [ '_' ];

	if ( properties.plural ) {
		wpFunc.push( 'n' );
	}
	if ( properties.context ) {
		wpFunc.push( 'x' );
	}

	wpFunc = wpFunc.join( '' );

	if ( 1 === wpFunc.length ) {
		return '__';
	}

	return wpFunc;
}

/**
 * Generate each line of equivalent php from a matching `translate()`
 * request found in the client code
 * @param  {object} properties - properties describing translation request
 * @param  {string} texdomain - optional string to be added as a textdomain value
 * @return {string}            the equivalent php code for each translation request
 */
function buildPHPString( properties, textdomain ) {
	var wpFunc = getGlotPressFunction( properties ),
		response = [],
		string,
		closing = textdomain ? ( ', "' + textdomain.replace( /"/g, '\\"' ) + '" ),' ) : ' ),',
		stringFromFunc = {
			__: '__( ' + properties.single + closing,
			_x: '_x( ' + [ properties.single, properties.context ].join( ', ' ) + closing,
			_nx: '_nx( ' + [ properties.single, properties.plural, properties.count, properties.context ].join( ', ' ) + closing,
			_n: '_n( ' + [ properties.single, properties.plural, properties.count ].join( ', ' ) + closing
		};

	// translations with comments get a preceding comment in the php code
	if ( properties.comment ) {
		// replace */ with *\/ to prevent translators from accidentally running arbitrary code
		response.push( '/* translators: ' + properties.comment.replace( /\*\//g, '*\\/' ) + ' */' );
	}

	string = stringFromFunc[ wpFunc ];

	if ( properties.line ) {
		string += ' // ' + properties.line;
	}

	response.push( string );

	return response.join( '\n' );
}


/**
 * Takes read file and generates a string representation of a file with
 * equivalent WordPress-style translate functions. Also prepends with some
 * necessary time and number translations.
 *
 * @param  {array} data        - the input file as read in by fs.readFile()
 * @param  {string} arrayName  - name of the array in the php resulting php file
 * @return {string}            - string representation of the final php file
 */
module.exports = function formatInPHP( matches, options ) {
	var arrayName = options.phpArrayName || ( options.projectName + '_i18n_strings' );
	return [
		// start of the php file
		'<?php',
		'/* THIS IS A GENERATED FILE. DO NOT EDIT DIRECTLY. */',
		'$' + arrayName + ' = array(',
			matches.map( function( element ) {
				return buildPHPString( element, options.textdomain );
			} ).join( '\n' ),
		');',
		'/* THIS IS THE END OF THE GENERATED FILE */'
	].join( '\n' );
};
