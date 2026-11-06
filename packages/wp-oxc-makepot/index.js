/**
 * Extract i18n-calypso `translate` and @wordpress/i18n `__`, `_n`, `_x`, `_nx` calls from one source
 * file into a POT file.
 *
 * The extraction rules follow @automattic/babel-plugin-i18n-calypso, which @automattic/wp-babel-makepot
 * runs through Babel, so both packages extract the same strings. That plugin credits
 * babel-gettext-extractor (https://github.com/getsentry/babel-gettext-extractor, MIT,
 * Copyright (c) 2015 jruchaud and Sentry).
 */
const { mkdirSync, readFileSync, writeFileSync } = require( 'fs' );
const { extname, relative, sep } = require( 'path' );
const { po } = require( 'gettext-parser' );
const { parseSync } = require( 'oxc-parser' );

const DEFAULT_HEADERS = { 'content-type': 'text/plain; charset=UTF-8' };

const DEFAULT_DIR = 'build/';

/**
 * The order of arguments in translate functions.
 * @type {Object}
 */
const DEFAULT_FUNCTIONS_ARGUMENTS_ORDER = {
	__: [],
	_n: [ 'msgid_plural' ],
	_x: [ 'msgctxt' ],
	_nx: [ 'msgid_plural', null, 'msgctxt' ],
	translate: [ 'msgid_plural', 'options_object' ],
};

const REGEXP_TRANSLATOR_COMMENT = /^\s*translators:\s*([\s\S]+)/im;

// A file can only have strings if it names a translate function; an aliased `translate` import
// still names `translate`.
const REGEXP_FUNCTION_NAME = new RegExp(
	`\\b(?:${ Object.keys( DEFAULT_FUNCTIONS_ARGUMENTS_ORDER ).join( '|' ) })\\b`
);

const isValidFunctionName = ( name ) =>
	Object.keys( DEFAULT_FUNCTIONS_ARGUMENTS_ORDER ).includes( name );

const isValidTranslationKey = ( key ) =>
	Object.values( DEFAULT_FUNCTIONS_ARGUMENTS_ORDER ).some( ( args ) => args.includes( key ) );

/**
 * Returns the string value of a translate function argument: string literals, the static parts of
 * template literals, and binary expressions of those.
 * @param {Object} node ESTree node.
 * @returns {string} String value.
 */
function getNodeAsString( node ) {
	if ( undefined === node ) {
		return '';
	}

	switch ( node.type ) {
		case 'BinaryExpression':
			return getNodeAsString( node.left ) + getNodeAsString( node.right );

		case 'Literal':
			return typeof node.value === 'string' ? node.value : '';

		case 'TemplateLiteral':
			return ( node.quasis || [] ).reduce(
				( string, element ) => string + element.value.cooked,
				''
			);

		default:
			return '';
	}
}

/**
 * Merge the properties of extracted string objects.
 * @param {Object} source left-hand string object
 * @param {Object} target right-hand string object
 */
function mergeStrings( source, target ) {
	if ( ! source.comments.reference.includes( target.comments.reference ) ) {
		source.comments.reference += '\n' + target.comments.reference;
	}

	if ( ! source.comments.extracted ) {
		source.comments.extracted = target.comments.extracted;
	} else if (
		target.comments.extracted &&
		! source.comments.extracted.includes( target.comments.extracted )
	) {
		source.comments.extracted += '\n' + target.comments.extracted;
	}

	// A previous singular string matches a plural string. In PO files those are merged.
	if ( ! source.hasOwnProperty( 'msgid_plural' ) && target.hasOwnProperty( 'msgid_plural' ) ) {
		source.msgid_plural = target.msgid_plural;
		source.msgstr = target.msgstr;
	}
}

const isNode = ( value ) => value && typeof value === 'object' && typeof value.type === 'string';

// Child nodes in source order of their fields, which is the order Babel visited them in.
function getChildren( node ) {
	const children = [];
	for ( const key of Object.keys( node ) ) {
		const value = node[ key ];
		if ( Array.isArray( value ) ) {
			value.forEach( ( child ) => isNode( child ) && children.push( child ) );
		} else if ( key !== 'type' && isNode( value ) ) {
			children.push( value );
		}
	}
	return children;
}

/**
 * Maps each node to the comments Babel would attach as its leading comments: a comment leads the
 * first node after it within the innermost node that contains it.
 * @param {Object} program  ESTree program.
 * @param {Array}  comments Comments with `start` and `end` offsets.
 * @returns {Map} Node to its leading comments.
 */
function getLeadingComments( program, comments ) {
	const leading = new Map();
	for ( const comment of comments ) {
		const contains = ( child ) => child.start <= comment.start && comment.end <= child.end;
		let container = program;
		let inner = getChildren( container ).find( contains );
		while ( inner ) {
			container = inner;
			inner = getChildren( container ).find( contains );
		}

		const next = getChildren( container )
			.filter( ( child ) => child.start >= comment.end )
			.sort( ( a, b ) => a.start - b.start )[ 0 ];
		if ( next ) {
			leading.set( next, [ ...( leading.get( next ) ?? [] ), comment ] );
		}
	}
	return leading;
}

// Babel parses calls after an optional chain's first `?.` as OptionalCallExpression, which the
// extraction never looked at.
function isInOptionalChain( call ) {
	for ( let node = call; node; ) {
		if ( node.optional ) {
			return true;
		}
		node = node.type === 'CallExpression' ? node.callee : node.object;
		if ( node && node.type !== 'CallExpression' && node.type !== 'MemberExpression' ) {
			return false;
		}
	}
	return false;
}

function getFunctionName( callee ) {
	if ( callee.type === 'MemberExpression' ) {
		return ! callee.computed && callee.property.type === 'Identifier'
			? callee.property.name
			: undefined;
	}
	return callee.type === 'Identifier' ? callee.name : undefined;
}

/**
 * Extracts the translatable strings of one file.
 * @param {string} filepath File to extract from.
 * @param {Object} options  `base` for reference paths, `headers`, and `functions` to override every
 *                          function's argument order.
 * @returns {Object|undefined} Strings keyed by context, then by msgid, or undefined when there are none.
 */
function extractStrings( filepath, options ) {
	const source = readFileSync( filepath, 'utf8' );
	if ( ! REGEXP_FUNCTION_NAME.test( source ) ) {
		return;
	}

	const extension = extname( filepath );
	const lang = { '.ts': 'ts', '.mts': 'ts', '.cts': 'ts', '.tsx': 'tsx' }[ extension ] ?? 'jsx';
	const { program, comments, errors } = parseSync( filepath, source, {
		lang,
		sourceType: 'module',
		preserveParens: false,
	} );
	if ( errors.length ) {
		throw new SyntaxError( errors[ 0 ].message );
	}

	const lineStarts = [ 0 ];
	for ( let i = source.indexOf( '\n' ); i !== -1; i = source.indexOf( '\n', i + 1 ) ) {
		lineStarts.push( i + 1 );
	}
	const getLine = ( offset ) => {
		let low = 0;
		let high = lineStarts.length - 1;
		while ( low < high ) {
			const middle = ( low + high + 1 ) >> 1;
			if ( lineStarts[ middle ] <= offset ) {
				low = middle;
			} else {
				high = middle - 1;
			}
		}
		return low + 1;
	};

	const leadingComments = getLeadingComments(
		program,
		comments.filter( ( comment ) => REGEXP_TRANSLATOR_COMMENT.test( comment.value ) )
	);
	const headers = options.headers || DEFAULT_HEADERS;
	const nplurals = ( headers[ 'plural-forms' ] || '' ).match( /nplurals\s*=\s*(\d+);/ )?.[ 1 ] ?? 2;
	const functions = { ...DEFAULT_FUNCTIONS_ARGUMENTS_ORDER };
	const reference = relative( options.base || '.', filepath )
		.split( sep )
		.join( '/' );
	const strings = {};
	const ancestors = [];

	// The first translator comment that leads the call or an ancestor starting on the same or the
	// previous line, and ends on one of those lines.
	const getExtractedComment = ( node ) => {
		const line = getLine( node.start );
		for ( const current of [ node, ...ancestors.toReversed() ] ) {
			const start = getLine( current.start );
			if ( current !== node && ( start < line - 1 || start > line ) ) {
				return;
			}
			for ( const comment of leadingComments.get( current ) ?? [] ) {
				const end = getLine( comment.end );
				const match =
					end >= line - 1 && end <= line && comment.value.match( REGEXP_TRANSLATOR_COMMENT );
				if ( match ) {
					return match[ 1 ]
						.split( '\n' )
						.map( ( text ) => text.trim() )
						.join( ' ' );
				}
			}
		}
	};

	const extractCall = ( node ) => {
		const name = getFunctionName( node.callee );
		if ( ! isValidFunctionName( name ) ) {
			return;
		}

		const translation = { msgid: getNodeAsString( node.arguments[ 0 ] ), msgstr: '', comments: {} };
		if ( ! translation.msgid.length ) {
			return;
		}

		const translator = getExtractedComment( node );
		if ( translator ) {
			translation.comments.extracted = translator;
		}
		translation.comments.reference = reference + ':' + getLine( node.start );

		const functionKeys = options.functions || functions[ name ];
		node.arguments.slice( 1 ).forEach( ( arg, index ) => {
			const key = functionKeys[ index ];
			if ( 'ObjectExpression' === arg.type ) {
				arg.properties.forEach( ( property ) => {
					if ( property.type !== 'Property' || property.kind !== 'init' || property.method ) {
						return;
					}
					const keyName =
						! property.computed && property.key.type === 'Identifier'
							? property.key.name
							: undefined;
					if ( 'context' === keyName ) {
						translation.msgctxt = property.value.value;
					}
					if ( 'comment' === keyName ) {
						translation.comments.extracted = property.value.value;
					}
				} );
			} else if ( isValidTranslationKey( key ) ) {
				translation[ key ] = getNodeAsString( arg );
			}
		} );

		// For plurals, create an empty msgstr array
		if ( ( translation.msgid_plural || '' ).length ) {
			translation.msgstr = Array.from( Array( Number( nplurals ) ) ).map( () => '' );
		}

		const { msgctxt = '', msgid } = translation;
		strings[ msgctxt ] ??= {};
		if ( ! strings[ msgctxt ].hasOwnProperty( msgid ) ) {
			strings[ msgctxt ][ msgid ] = translation;
		} else {
			mergeStrings( strings[ msgctxt ][ msgid ], translation );
		}
	};

	const visit = ( node ) => {
		// An aliased `translate` import from i18n-calypso gets translate's argument order.
		if ( node.type === 'ImportDeclaration' && 'i18n-calypso' === node.source.value ) {
			node.specifiers.forEach( ( specifier ) => {
				if ( specifier.imported && 'translate' === specifier.imported.name && specifier.local ) {
					functions[ specifier.local.name ] = functions.translate;
				}
			} );
		}
		if ( node.type === 'CallExpression' && ! isInOptionalChain( node ) ) {
			extractCall( node );
		}
		ancestors.push( node );
		getChildren( node ).forEach( visit );
		ancestors.pop();
	};
	visit( program );

	return Object.keys( strings ).length ? { strings, headers } : undefined;
}

/**
 * Writes the POT file for one source file to `options.dir`, if it has translatable strings.
 * @param {string} filepath File to extract from.
 * @param {Object} options  `dir`, `base`, `headers`, `functions`.
 */
module.exports = ( filepath, options = {} ) => {
	try {
		const extracted = extractStrings( filepath, options );
		if ( ! extracted ) {
			return;
		}

		const header = { msgid: '', msgstr: [] };
		for ( const key in extracted.headers ) {
			header.msgstr.push( `${ key }: ${ extracted.headers[ key ] };\n` );
		}
		const translations = { '': { '': header } };
		for ( const context of Object.keys( extracted.strings ) ) {
			translations[ context ] = { ...translations[ context ], ...extracted.strings[ context ] };
		}

		const dir = options.dir || DEFAULT_DIR;
		mkdirSync( dir, { recursive: true } );
		const pathname = relative( options.base || '.', filepath )
			.split( sep )
			.join( '-' );
		writeFileSync(
			dir + pathname + '.pot',
			po.compile( { charset: 'utf-8', headers: extracted.headers, translations } )
		);
	} catch ( error ) {
		console.error( filepath, error );
	}
};
