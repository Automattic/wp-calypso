
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
 * @return {string}            the equivalent php code for each translation request
 */
function buildPHPString( properties ) {
	var wpFunc = getGlotPressFunction( properties ),
		response = [],
		stringFromFunc = {
			__: '\n__( ' + encapsulateString( properties.single ) + ' ),',
			_x: '\n_x( ' + [ properties.single, properties.context ].map( encapsulateString ).join( ', ' ) + ' ),',
			_nx: '\n_nx( ' + [ properties.single, properties.plural, properties.count, properties.context ].map( encapsulateString ).join( ', ' ) + ' ),',
			_n: '\n_n( ' + [ properties.single, properties.plural, properties.count ].map( encapsulateString ).join( ', ' ) + ' ),'
		};

	// translations with comments get a preceding comment in the php code
	if ( properties.comment ) {
		// replace */ with *\/ to prevent translators from accidentally running arbitrary code
		response.push( '\n/* translators: ' + properties.comment.replace( /\*\//g, '*\\/' ) + ' */' );
	}

	response.push( stringFromFunc[ wpFunc ] );

	return response.join( '' );
}

/**
 * Takes a string argument and turns it into a valid string representation for most languages/format (with double quotes)
 * Anything else than a string is left unchanged
 * @param  {string} input  - origin string or other type of input
 * @return {string}        - universal representation of string or input unchanged
 */
function encapsulateString( input ) {
	if ( 'string' !== typeof input ) return input;
	return "'" + input.replace( /(\\|\')/g, '\\$1' ) + "'";
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
		'\n/* THIS IS A GENERATED FILE. DO NOT EDIT DIRECTLY. */',
		'\n$' + arrayName + ' = array(',
			matches.map( buildPHPString ).join( '\n' ),
		'\n);',
		'\n/* THIS IS THE END OF THE GENERATED FILE */'
	].join( '' );
};
