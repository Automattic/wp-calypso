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
	var finalProps = {},
		options, i, keyName, args;

	if ( ! match.arguments.length ) {
		return;
	}

	args = match.arguments;

	// first string argument
	if ( args[ 0 ].type === 'Literal' ) {
		finalProps.single = args[ 0 ].value;
	} else if ( args[ 0 ].type === 'BinaryExpression' ) {
		finalProps.single = concatenateBinaryExpression( args[ 0 ] );
	}

	// second string argument
	if ( args[ 1 ] ) {
		if ( args[ 1 ].type === 'Literal' ) {
			finalProps.plural = args[ 1 ].value;
		} else if ( args[ 1 ].type === 'BinaryExpression' ) {
			finalProps.plural = concatenateBinaryExpression( args[ 1 ] );
		}
	}

	// options could be in position 0, 1, or 2, but there can only be one
	for ( i = 0; i < args.length; i++ ) {
		if ( args[ i ].type === 'ObjectExpression' ) {
			options = args[ i ];
			break;
		}
	}

	if ( 'undefined' !== typeof options ) {
		// map options to finalProps object
		options.properties.forEach( function( property ) {
			// key might be an  Identifier (name), or a Literal (value)
			var key = property.key.name || property.key.value;
			if ( 'Literal' === property.value.type ) {
				keyName = ( key === 'original' ) ? 'single' : key;
				finalProps[ keyName ] = property.value.value;
			} else if ( 'ObjectExpression' === property.value.type && 'original' === key ) {
				// Get pluralization strings. This clause can be removed when all translations
				// are updated to the new approach for plurals.
				property.value.properties.forEach( function( innerProp ) {
					finalProps[ innerProp.key.name || innerProp.key.value ] = innerProp.value.value;
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
	var result;
	if ( ASTNode.operator !== '+' ) {
		return false;
	}
	result = ( ASTNode.left.type === 'Literal' ) ? ASTNode.left.value : concatenateBinaryExpression( ASTNode.left );
	result += ( ASTNode.right.type === 'Literal' ) ? ASTNode.right.value : concatenateBinaryExpression( ASTNode.right );

	return result;
}
