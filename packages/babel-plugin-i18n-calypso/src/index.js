/**
 * extract both i18n-calypso `translate` and @wordpress/i18n function calls into a POT file
 *
 * Credits:
 *
 * babel-gettext-extractor
 * https://github.com/getsentry/babel-gettext-extractor
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 jruchaud
 * Copyright (c) 2015 Sentry
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * External dependencies
 */

const { po } = require( 'gettext-parser' );
const { forEach, merge, isEmpty } = require( 'lodash' );
const { relative, sep } = require( 'path' );
const { writeFileSync } = require( 'fs' );

/**
 * Default output headers if none specified in plugin options.
 *
 * @type {Object}
 */
const DEFAULT_HEADERS = {
	'content-type': 'text/plain; charset=UTF-8',
	'x-generator': 'babel-plugin-i18n-calypso',
};

/**
 * Default functions to parse if none specified in plugin options. Each key is
 * a CallExpression name (or member name) and the value an array corresponding
 * to translation key argument position.
 *
 * @type {Object}
 */
const DEFAULT_FUNCTIONS = {
	__: [ 'msgid' ],
	_n: [ 'msgid', 'msgid_plural' ],
	_x: [ 'msgid', 'msgctxt' ],
	_nx: [ 'msgid', 'msgid_plural', null, 'msgctxt' ],
};

/**
 * Set of keys which are valid to be assigned into a translation object.
 *
 * @type {string[]}
 */
const VALID_TRANSLATION_KEYS = [ 'msgid', 'msgid_plural', 'msgctxt' ];

/**
 * Regular expression matching translator comment value.
 *
 * @type {RegExp}
 */
const REGEXP_TRANSLATOR_COMMENT = /^\s*translators:\s*([\s\S]+)/im;

/**
 * Given an argument node (or recursed node), attempts to return a string
 * represenation of that node's value.
 *
 * @param {Object} node AST node.
 *
 * @return {string} String value.
 */
function getNodeAsString( node ) {
	if ( undefined === node ) {
		return '';
	}

	switch ( node.type ) {
		case 'BinaryExpression':
			return (
				getNodeAsString( node.left ) +
				getNodeAsString( node.right )
			);

		case 'StringLiteral':
			return node.value;

		default:
			return '';
	}
}

/**
 * Returns translator comment for a given AST traversal path if one exists.
 *
 * @param {Object} path              Traversal path.
 * @param {number} _originalNodeLine Private: In recursion, line number of
 *                                     the original node passed.
 *
 * @return {?string} Translator comment.
 */
function getTranslatorComment( path, _originalNodeLine ) {
	const { node, parent, parentPath } = path;

	// Assign original node line so we can keep track in recursion whether a
	// matched comment or parent occurs on the same or previous line
	if ( ! _originalNodeLine ) {
		_originalNodeLine = node.loc.start.line;
	}

	let comment;
	forEach( node.leadingComments, ( commentNode ) => {
		const { line } = commentNode.loc.end;
		if ( line < _originalNodeLine - 1 || line > _originalNodeLine ) {
			return;
		}

		const match = commentNode.value.match( REGEXP_TRANSLATOR_COMMENT );
		if ( match ) {
			// Extract text from matched translator prefix
			comment = match[ 1 ].split( '\n' ).map( ( text ) => text.trim() ).join( ' ' );

			// False return indicates to Lodash to break iteration
			return false;
		}
	} );

	if ( comment ) {
		return comment;
	}

	if ( ! parent || ! parent.loc || ! parentPath ) {
		return;
	}

	// Only recurse as long as parent node is on the same or previous line
	const { line } = parent.loc.start;
	if ( line >= _originalNodeLine - 1 && line <= _originalNodeLine ) {
		return getTranslatorComment( parentPath, _originalNodeLine );
	}
}

/**
 * Returns true if the specified key of a function is valid for assignment in
 * the translation object.
 *
 * @param {string} key Key to test.
 *
 * @return {boolean} Whether key is valid for assignment.
 */
function isValidTranslationKey( key ) {
	return -1 !== VALID_TRANSLATION_KEYS.indexOf( key );
}

module.exports = function () {
	let strings = {};
	let nplurals = 2,
		baseData;

	function wordpress_i18n_CallExpression( path, state ) {
		const { callee } = path.node;

		// Determine function name by direct invocation or property name
		let name;
		if ( 'MemberExpression' === callee.type ) {
			name = callee.property.name;
		} else {
			name = callee.name;
		}

		// Skip unhandled functions
		const functionKeys = ( state.opts.functions || DEFAULT_FUNCTIONS )[ name ];
		if ( ! functionKeys ) {
			return;
		}

		// Assign translation keys by argument position
		const translation = path.node.arguments.reduce( ( memo, arg, i ) => {
			const key = functionKeys[ i ];
			if ( isValidTranslationKey( key ) ) {
				memo[ key ] = getNodeAsString( arg );
			}

			return memo;
		}, {} );

		// Can only assign translation with usable msgid
		if ( ! translation.msgid ) {
			return;
		}

		// At this point we assume we'll save data, so initialize if
		// we haven't already
		if ( ! baseData ) {
			baseData = {
				charset: 'utf-8',
				headers: state.opts.headers || DEFAULT_HEADERS,
				translations: {
					'': {
						'': {
							msgid: '',
							msgstr: [],
						},
					},
				},
			};

			for ( const key in baseData.headers ) {
				baseData.translations[ '' ][ '' ].msgstr.push( `${ key }: ${ baseData.headers[ key ] };\n` );
			}

			// Attempt to exract nplurals from header
			const pluralsMatch = ( baseData.headers[ 'plural-forms' ] || '' ).match( /nplurals\s*=\s*(\d+);/ );
			if ( pluralsMatch ) {
				nplurals = pluralsMatch[ 1 ];
			}
		}

		// Create empty msgstr or array of empty msgstr by nplurals
		if ( translation.msgid_plural ) {
			translation.msgstr = Array.from( Array( nplurals ) ).map( () => '' );
		} else {
			translation.msgstr = '';
		}

		// Assign file reference comment, ensuring consistent pathname
		// reference between Win32 and POSIX
		const { filename } = this.file.opts;
		const pathname = relative( '.', filename ).split( sep ).join( '/' );
		translation.comments = {
			reference: pathname + ':' + path.node.loc.start.line,
		};

		// If exists, also assign translator comment
		const translator = getTranslatorComment( path );
		if ( translator ) {
			translation.comments.extracted = translator;
		}

		// Create context grouping for translation if not yet exists
		const { msgctxt = '', msgid } = translation;
		if ( ! strings.hasOwnProperty( msgctxt ) ) {
			strings[ msgctxt ] = {};
		}

		if ( ! strings[ msgctxt ].hasOwnProperty( msgid ) ) {
			strings[ msgctxt ][ msgid ] = translation;
		} else {
			strings[ msgctxt ][ msgid ].comments.reference += '\n' + translation.comments.reference;
		}
	};

	function i18n_calypso_CallExpression( path, state ) {
		const { callee } = path.node;

		// Determine function name by direct invocation or property name
		let name;
		if ( 'MemberExpression' === callee.type ) {
			name = callee.property.name;
		} else {
			name = callee.name;
		}
		if ( 'translate' !== name ) {
			return;
		}
		let i = 0;

		const translation = {
			msgid: getNodeAsString( path.node.arguments[i++] ),
			msgstr: '',
			comments: {},
		}

		if ( ! translation.msgid.length ) {
			return;
		}

		// At this point we assume we'll save data, so initialize if
		// we haven't already
		if ( ! baseData ) {
			baseData = {
				charset: 'utf-8',
				headers: state.opts.headers || DEFAULT_HEADERS,
				translations: {
					'': {
						'': {
							msgid: '',
							msgstr: [],
						},
					},
				},
			};

			for ( const key in baseData.headers ) {
				baseData.translations[ '' ][ '' ].msgstr.push( `${ key }: ${ baseData.headers[ key ] };\n` );
			}

			// Attempt to exract nplurals from header
			const pluralsMatch = ( baseData.headers[ 'plural-forms' ] || '' ).match( /nplurals\s*=\s*(\d+);/ );
			if ( pluralsMatch ) {
				nplurals = pluralsMatch[ 1 ];
			}
		}

		if ( path.node.arguments.length > i ) {
			const msgid_plural = getNodeAsString( path.node.arguments[i] );
			if ( msgid_plural.length ) {
				translation.msgid_plural = msgid_plural;
				i++;
				// For plurals, create an empty mgstr array
				translation.msgstr = Array.from( Array( nplurals ) ).map( () => '' );
			}
		}

		const { filename } = this.file.opts;
		const pathname = relative( '.', filename ).split( sep ).join( '/' );
		translation.comments.reference = pathname + ':' + path.node.loc.start.line;

		if ( path.node.arguments.length > i && 'ObjectExpression' === path.node.arguments[i].type ) {
			for ( const j in path.node.arguments[i].properties ) {
				if ( 'ObjectProperty' === path.node.arguments[i].properties[j].type ) {
					switch ( path.node.arguments[i].properties[j].key.name ) {
						case 'context':
							translation.msgctxt = path.node.arguments[i].properties[j].value.value;
							break;
						case 'comment':
							translation.comments.extracted = path.node.arguments[i].properties[j].value.value;
							break;
					}
				}
			}
		}

		// Create context grouping for translation if not yet exists
		const { msgctxt = '', msgid } = translation;
		if ( ! strings.hasOwnProperty( msgctxt ) ) {
			strings[ msgctxt ] = {};
		}

		if ( ! strings[ msgctxt ].hasOwnProperty( msgid ) ) {
			strings[ msgctxt ][ msgid ] = translation;
		} else {
			strings[ msgctxt ][ msgid ].comments.reference = '\n' + translation.comments.reference;
		}
	};

	return {
		visitor: {
			CallExpression( path, state ) {
				wordpress_i18n_CallExpression.apply( this, [ path, state ] );
				i18n_calypso_CallExpression.apply( this, [ path, state ] );
			},
			Program: {
				enter() {
					strings = {};
				},
				exit() {
					if ( isEmpty( strings ) ) {
						return;
					}

					const data = merge( {}, baseData, { translations: strings } );

					const compiled = po.compile( data );
					writeFileSync( this.file.opts.filename + '.pot', compiled );
				},
			},
		}
	};
};

