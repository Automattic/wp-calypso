/** @format */
/**
 * Takes an xgettext-js match and processes it into a form more easily consumed
 * by server-side i18n functions.
 *
 * Returns an object  *
 * Specifically:
 *  - facilitates simple string concatenation inside translate,
 *     e.g. translate( "A long string " + "broken up over multiple lines" ),
 *  - wraps quotes and backslashes for php consumption
 *
 * @param  {object} match - parser matching object
 * @return {object} data object combining the strings and options passed into translate();
 */
module.exports = function preProcessXGettextJSMatch( match ) {
	const finalProps = { line: match.line };
	let options;
	let keyName;

	if ( ! match.arguments.length ) {
		return;
	}

	const args = match.arguments;

	[ 'single', 'plural', 'options' ].slice( 0, args.length ).forEach( function( field, i ) {
		if ( 'StringLiteral' === args[ i ].type ) {
			finalProps[ field ] = makeDoubleQuoted( args[ i ].extra.raw );
		} else if ( 'BinaryExpression' === args[ i ].type ) {
			finalProps[ field ] = encapsulateString( concatenateBinaryExpression( args[ i ] ) );
		} else if ( 'ObjectExpression' === args[ i ].type && 'undefined' === typeof options ) {
			options = args[ i ];
		} else if ( 'TemplateLiteral' === args[ i ].type ) {
			finalProps[ field ] = makeDoubleQuoted( '`' + args[ i ].quasis[ 0 ].value.raw + '`' );
		}
	} );

	if ( 'undefined' !== typeof options ) {
		// map options to finalProps object
		options.properties.forEach( function( property ) {
			// key might be an  Identifier (name), or a StringLiteral (value)
			const key = property.key.name || property.key.value;
			if ( 'StringLiteral' === property.value.type ) {
				keyName = key === 'original' ? 'single' : key;
				finalProps[ keyName ] =
					'comment' === key ? property.value.value : makeDoubleQuoted( property.value.extra.raw );
			} else if ( 'ObjectExpression' === property.value.type && 'original' === key ) {
				// Get pluralization strings. This clause can be removed when all translations
				// are updated to the new approach for plurals.
				property.value.properties.forEach( function( innerProp ) {
					if ( 'StringLiteral' === innerProp.value.type ) {
						finalProps[ innerProp.key.name || innerProp.key.value ] = makeDoubleQuoted(
							innerProp.value.extra.raw
						);
					}
				} );
			}
		} );
	}

	// We don't care about the actual count value on the server, we just want to
	// register the translation string in GlotPress, and the real count value
	// will be used on the client to determine which plural version to display.
	if ( typeof finalProps.plural !== 'undefined' ) {
		finalProps.count = 1;
	}

	// Brittle test to check for collision of the method name because d3
	// also provides a translate() method. Longer-term solution would be
	// better namespacing.
	if ( ! finalProps.single ) {
		return false;
	}

	return finalProps;
};

/**
 * Long translation strings can be broken into multiple strings concatenated with the + operator.
 * This function concatenates the substrings into a single string.
 * @param  {object} ASTNode - the BinaryExpression object returned from the AST parser
 * @return {string}          - the concatenated string
 */
function concatenateBinaryExpression( ASTNode ) {
	let result;
	if ( ASTNode.operator !== '+' ) {
		return false;
	}
	result =
		'StringLiteral' === ASTNode.left.type
			? ASTNode.left.value
			: concatenateBinaryExpression( ASTNode.left );
	result +=
		'StringLiteral' === ASTNode.right.type
			? ASTNode.right.value
			: concatenateBinaryExpression( ASTNode.right );

	return result;
}

/**
 * Takes a valid javascript literal (with the quotes included) and returns a double-quoted
 * version of that string
 *
 * @param  {string} literal - origin literal (string with quotes)
 * @return {string}         - double quote representation of the string
 */
function makeDoubleQuoted( literal ) {
	if ( ! literal || literal.length < 2 ) {
		return undefined;
	}

	// double-quoted string
	if ( literal.charAt( 0 ) === '"' ) {
		return literal.replace( /(\\)/g, '\\$1' );
	}

	// single-quoted string
	if ( literal.charAt( 0 ) === "'" ) {
		return (
			'"' +
			literal
				.substring( 1, literal.length - 1 )
				.replace( /\\'/g, "'" )
				.replace( /(\\|")/g, '\\$1' ) +
			'"'
		);
	}

	// ES6 string
	if ( literal.charAt( 0 ) === '`' ) {
		return (
			'"' +
			literal
				.substring( 1, literal.length - 1 )
				.replace( /`/g, '`' )
				.replace( /(\\|")/g, '\\$1' ) +
			'"'
		);
	}

	return '';
}

/**
 * Takes a string argument and turns it into a valid string representation for most languages/format (with double quotes)
 * Anything else than a string is left unchanged
 * @param  {string} input  - origin string or other type of input
 * @return {string}        - universal representation of string or input unchanged
 */
function encapsulateString( input ) {
	if ( 'string' !== typeof input ) return input;
	return '"' + input.replace( /(\\|")/g, '\\$1' ) + '"';
}
