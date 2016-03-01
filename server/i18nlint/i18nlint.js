#!/usr/bin/env node

/**
 * Module dependencies/
 */
var fs = require( 'fs' ),
	XGettext = require( 'xgettext-js' ),
	debug = require( 'debug' )( 'calypso:i18nlint' ),
	babel = require( 'babel-core' ),
	preProcessXGettextJSMatch = require( '../i18n/preprocess-xgettextjs-match.js' ),
	SourceMapConsumer = require( 'source-map' ).SourceMapConsumer,
	tokenize = require( '../../client/lib/interpolate-components/tokenize.js' ),
	includes = require( 'lodash/includes' ),
	flow = require( 'lodash/flow' );

/*
 * Module variables
 */

var regexForPlaceholders,
	parser,
	sourceMapConsumer,
	debugFilename,
	_warnings,
	_transformedSource,
	_strictLiteralArguments;

// Regex to find placeholders adapted from
// sprintf https://github.com/alexei/sprintf.js/blob/c3ac006aff511dda804589af8f5b3c0d5da5afb1/src/sprintf.js#L7
// We are looking for all placeholders anywhere in the string, and we don't want the capture groups
regexForPlaceholders = /(?:\x25\x25)|(\x25(?:(?:[1-9]\d*)\$|\((?:[^\)]+)\))?(?:\+)?(?:0|'[^$])?(?:-)?(?:\d+)?(?:\.(?:\d+))?(?:[b-fiosuxX]))/g;

// I couldn't find a to correctly match '%s', '%s%s' and not match '%%s' with a
// javascript regex, so the easiest way is to consume escaped % characters and
// then filter out escaped %.
function findPlaceholders( string ) {
	if ( ! string || ! string.match ) {
		return [];
	}

	return ( string.match( regexForPlaceholders ) || [] )
		.filter( function( v ) {
			return v !== '\x25\x25';
		} );
}

// parser object that looks for calls to translate() and scans instances for
// problems with translation strings.
// Pushing warnings out of here is a hack to take advantage of the matching code
// in XGettext.  By rights, we should be using acorn or uglify-js directly to
// do something like this.
parser = new XGettext( {
	keywords: {
		translate: function( match ) {
			var finalProps = preProcessXGettextJSMatch( match );

			auditASTNodeForVariablesInTranslateArguments( match, finalProps, _warnings );

			if ( ! finalProps ) {
				return; // invalid input, skip this match
			}

			try {
				// Results are dumped directly into warnings
				auditASTNodeForMismatchedPlaceholders( match, finalProps, _warnings );
				auditASTNodeForUnqualifiedPlaceholders( match, finalProps, _warnings );
				auditASTNodeForEllipses( match, finalProps, _warnings );
				auditASTNodeForStringsThatAreJustPlaceholders( match, finalProps, _warnings );
			} catch ( err ) {
				debug( 'i18nlint error: ', err, '\n    Error occured checking AST Node:', match, '\n    finalProps: ', finalProps );
			}
		}
	}
} );

/**
 * Parses file text and returns an array of warnings
 *
 * @param  {array} data        - the input file as read in by fs.readFile()
 * @return {array} warnings    - An array of strings describing issues found
 */
function scanSource( data ) {
	// find matching instances of `translate()` and generate corresponding php output
	_warnings = [];
	try {
		// This dumps results directly into _warnings
		parser.getMatches( data );
	} catch ( err ) {
		debug( 'failed to parse ' + debugFilename );
	}

	return _warnings;
}

// Clear out hashbangs to keep acorn and jsx happy
function trimHashBang( sourceString ) {
	return sourceString.replace( /^#.*?\n/, '\n' );
}

function processJsx( sourceString ) {
	var transformedJsxSource;
	sourceMapConsumer = undefined;

	try {
		transformedJsxSource = babel.transform( sourceString, { sourceMaps: true } );
		sourceMapConsumer = new SourceMapConsumer( transformedJsxSource.map );
	} catch ( err ) {
		debug( 'babel.transform() failed' +
			( debugFilename ? ' for ' + debugFilename : '' ) );
		transformedJsxSource = { code: sourceString };
	}
	return transformedJsxSource.code;
}

function originalLocation( location ) {
	return sourceMapConsumer &&
		sourceMapConsumer.originalPositionFor( location ) ||
		location;
}

// Transform positions in warnings with sourcemap
function correctLocationsInWarnings( warnings ) {
	warnings.forEach( function( warning ) {
		warning.location = originalLocation( warning.location );
	} );
	return warnings;
}

/**
 * Reads the inputFile and generates an array of warnings for suspicious
 * translate() usage.
 * @param  {string}   inputFile  - location of the javascript file to parse
 * @returns {[warnings]} An array of objects describing the issues found.
 */
function scanFile( inputFile ) {
	// Reset output so we can call this repeatedly when used as a module;
	debugFilename = inputFile;

	_transformedSource = processJsx( trimHashBang( fs.readFileSync( inputFile, 'utf8' ) ) );
	return correctLocationsInWarnings( scanSource( _transformedSource ) );
}

/*
 *  The actual tests we're performing
 */
function auditStringForUnqualifiedPlaceholders( string ) {
	var unqualifiedPlaceholders;
	if ( typeof string !== 'string' ) {
		return false;
	}

	unqualifiedPlaceholders = findPlaceholders( string ).filter( function( v ) {
		return ! v.match( /[0-9()]/ );
	} );

	if ( unqualifiedPlaceholders.length <= 1 ) {
		return false;
	}

	return 'Translators need to be able to change the order of strings, so multiple placeholders in a translation should be named. E.g.:\n' +
		'    translate(\'%(greeting)s, %(name)s!\', { args: { greeting:\'Hello\', name:\'World\' } } )"';
}

function singleOriginal( properties ) {
	return 'translate( ' + properties.single + ', \u2026 )';
}

function pluralOriginal( properties ) {
	return 'translate( \u2026 , ' + properties.plural + ', \u2026 )';
}

// It would be nice to point inside options objects to the specific offending
// part, but that's pretty complicated, so we'll settle for just pointing at
// the right argument
function pluralArgumentIndex( node ) {
	return node.arguments.length === 1 ? 0 : 1;
}

function auditASTNodeForStringsThatAreJustPlaceholders( node, properties, warnings ) {
	var stripPlaceholders;

	function stripCalypsoComponents( string ) {
		return tokenize( string )
			.filter( function( token ) {
				return token.type === 'string';
			} )
			.map( function( token ) {
				return token.value;
			} )
			.join( '' );
	}

	function stripPrintfPlaceholders( string ) {
		return string.replace( regexForPlaceholders, '' ); // strip printf placeholders
	}

	function stripQuotesFromAcornRawValue( string ) {
		return string.replace( /^'(.*)'$/, '$1' );
	}

	stripPlaceholders = flow(
		stripQuotesFromAcornRawValue,
		stripPrintfPlaceholders,
		stripCalypsoComponents
	);

	if ( stripPlaceholders( properties.single ).length === 0 ) {
		warnings.push( {
			string: 'We shouldn\'t translate() strings that are entirely placeholders',
			original: singleOriginal( properties ),
			location: node.arguments[ 0 ].loc.start
		} );
	}

	if ( properties.plural && stripPlaceholders( properties.plural ).length === 0 ) {
		warnings.push( {
			string: 'We shouldn\'t translate() strings that are entirely placeholders (plural)',
			original: pluralOriginal( properties ),
			location: node.arguments[ pluralArgumentIndex( node ) ].loc.start
		} );
	}
}

function auditASTNodeForUnqualifiedPlaceholders( node, properties, warnings ) {
	var singleWarning, pluralWarning;

	if ( ( singleWarning = auditStringForUnqualifiedPlaceholders( properties.single ) ) ) {
		warnings.push( {
			string: singleWarning,
			original: singleOriginal( properties ),
			location: node.arguments[ 0 ].loc.start
		} );
	}

	if ( ( pluralWarning = auditStringForUnqualifiedPlaceholders( properties.plural ) ) ) {
		// Will the plural always be the second argument?
		warnings.push( {
			string: pluralWarning,
			original: pluralOriginal( properties ),
			location: node.arguments[ pluralArgumentIndex( node ) ].loc.start
		} );
	}
}

function auditASTNodeForMismatchedPlaceholders( node, properties, warnings ) {
	// check for translate calls where the plural and the singular strings have
	// a different number of placeholders, as this is virtually always wrong
	// and includes the super-common "One thing", "%d things" anti-pattern.

	if ( ! properties.single || ! properties.plural ) {
		return;
	}

	if ( findPlaceholders( properties.single ).length !==
			findPlaceholders( properties.plural ).length ) {
		warnings.push( {
			string: 'Placeholders in the plural and singular strings should match, as some languages use the singular for values like 21, 31 etc.  If there should be a different string for 1 or 0, special case it in the code.',
			original: 'translate( ' + properties.single + ', ' + properties.plural + '\u2026 )',
			location: node.arguments[ pluralArgumentIndex( node ) ].loc.start
		} );
	}
}

function isObject( node ) {
	return node && node.type && node.type === 'ObjectExpression';
}

function isNotAcceptableTranslateArgument( node ) {
	// Technically, it would be ok to have a variable for the options as
	// long as there's no context or comment, but allowing that seems more
	// likely to lead to confusion than convenience.

	return ! ( node && node.type &&
		includes( [ 'Literal', 'ObjectExpression', 'BinaryExpression' ], node.type ) );
}

function isRelevantProperty( property ) {
	return includes( [ 'context', 'comment' ], keyName( property ) );
}

/* Grab the content out of from the source */
function ASTArgumentToString( argument ) {
	if ( argument.raw ) {
		return argument.raw;
	}
	if ( argument.start && argument.end ) {
		return _transformedSource.slice( argument.start, argument.end )
			.replace( /\s+/g, ' ' );
	}
}

// Handle Identifier and Literal property keys e.g. { foo: 1 } and { 'foo': 1 }
function keyName( property ) {
	return property.key.name || property.key.value;
}

// The options argument is really challenging here.  Comments and contexts
// behind an identifier are broken, but on the other hand it's very natural to
// populate args and count with variables.  For now, this will let us manually
// find instances that need to be checked, without false positives.
_strictLiteralArguments = process.env.I18NLINT_STRICT;

/*
 * We use static analysis to lift original, plural, context and comment strings
 * out of the source, and export them to po.files.
 * This means that if you pass any of these values in as variables, we can't
 * pick them up, and they will be translated incorrectly (for context or comment)
 * or not at all (for original and plural strings).
 *
 * This can easily catch developers off guard, as they have to be very familiar
 * with the translation processes to even be aware that there might be an issue
 * here.
 * see 4952-gh-calypso-pre-oss
 *
 * This function checks that the arguments to translate() are literal
 * strings (for the single and plural strings) and a literal object (for options).
 * If it does find a literal object for the options, it further checks that the
 * comment and context fields in that object are literal strings.
 *
 * NOTE:  This check does *not* enforce literal objects for options, because it
 * is both common and reasonable to use variables to handle things like count
 * and args, which the static checks do not need to see.
 *
 * This does leave an unfortunate hole, where if the options are passed as a
 * variable, and that variable has a comment or a context, the translation will
 * be suspect, and we don't warn the developer :(
 */
function auditASTNodeForVariablesInTranslateArguments( node, properties, warnings ) {
	var originalString, i,
		numberOfArgsToCheck = node.arguments.length === 3 ? 2 : 1;

	// This check has to work on calls that preProcessXGettextJSMatch() doesn't,
	// so we can't rely on it's properties, and have to rebuild the original
	// translate() call from the source instead
	originalString = 'translate( ' +
		node.arguments.map( ASTArgumentToString ).join( ', ' ) + ' )';

	if ( _strictLiteralArguments ) {
		numberOfArgsToCheck = node.arguments.length;
	}

	for ( i = 0; i < numberOfArgsToCheck; i++ ) {
		if ( isNotAcceptableTranslateArgument( node.arguments[ i ] ) ) {
			warnings.push( {
				string: "We can't pass variables or functions to translate() (only string literals).\n" +
					'    See https://wpcalypso.wordpress.com/devdocs/client/lib/mixins/i18n#strings-only',
				original: originalString,
				location: node.arguments[ i ].loc.start
			} );
		}
	}

	// We also need to make sure that comment and context are literals
	// so we're looking for objects with a context or comment, and making sure
	// that those are ok that those are ok.
	node.arguments.filter( isObject ).forEach( function( objectArgument ) {
		var releventProperties = objectArgument.properties.filter( isRelevantProperty );

		for ( i = 0; i < releventProperties.length; i++ ) {
			if ( isNotAcceptableTranslateArgument( releventProperties[ i ].value ) ) {
				warnings.push( {
					string: "'" + keyName( releventProperties[ i ] ) + "' " +
						"option in translate() can't be a variable or function (it must be a string literal).\n" +
						'    See https://wpcalypso.wordpress.com/devdocs/client/lib/mixins/i18n#strings-only',
					original: originalString,
					location: releventProperties[ i ].value.loc.start
				} );
			}
		}
	} );
}

function auditASTNodeForEllipses( node, properties, warnings ) {
	var threeDotsRegex = /\.\.\./,
		warningString = 'Use the UTF-8 character \'…\' (Horizontal Ellipsis, U+2026) rather than three dots in user-facing strings';

	if ( properties.single.match( threeDotsRegex ) ) {
		warnings.push( {
			string: warningString,
			original: singleOriginal( properties ),
			location: node.arguments[ 0 ].loc.start
		} );
	}
	if ( properties.plural && properties.plural.match( threeDotsRegex ) ) {
		warnings.push( {
			string: warningString,
			original: pluralOriginal( properties ),
			location: node.arguments[ pluralArgumentIndex( node ) ].loc.start
		} );
	}
}

module.exports = {
	scanFile: scanFile,
	scanSource: scanSource,
	auditStringForUnqualifiedPlaceholders: auditStringForUnqualifiedPlaceholders,
	trimHashBang: trimHashBang
};
