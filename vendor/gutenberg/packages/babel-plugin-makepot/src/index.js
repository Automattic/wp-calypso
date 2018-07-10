/**
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
const { pick, reduce, uniq, forEach, sortBy, isEqual, merge, isEmpty } = require( 'lodash' );
const { relative, sep } = require( 'path' );
const { writeFileSync } = require( 'fs' );

/**
 * Default output headers if none specified in plugin options.
 *
 * @type {Object}
 */
const DEFAULT_HEADERS = {
	'content-type': 'text/plain; charset=UTF-8',
	'x-generator': 'babel-plugin-makepot',
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
 * Default file output if none specified.
 *
 * @type {string}
 */
const DEFAULT_OUTPUT = 'gettext.pot';

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

/**
 * Given two translation objects, returns true if valid translation keys match,
 * or false otherwise.
 *
 * @param {Object} a First translation object.
 * @param {Object} b Second translation object.
 *
 * @return {boolean} Whether valid translation keys match.
 */
function isSameTranslation( a, b ) {
	return isEqual(
		pick( a, VALID_TRANSLATION_KEYS ),
		pick( b, VALID_TRANSLATION_KEYS )
	);
}

module.exports = function() {
	const strings = {};
	let nplurals = 2,
		baseData;

	return {
		visitor: {
			CallExpression( path, state ) {
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
					translation.comments.translator = translator;
				}

				// Create context grouping for translation if not yet exists
				const { msgctxt = '', msgid } = translation;
				if ( ! strings[ filename ].hasOwnProperty( msgctxt ) ) {
					strings[ filename ][ msgctxt ] = {};
				}

				strings[ filename ][ msgctxt ][ msgid ] = translation;
			},
			Program: {
				enter() {
					strings[ this.file.opts.filename ] = {};
				},
				exit( path, state ) {
					const { filename } = this.file.opts;
					if ( isEmpty( strings[ filename ] ) ) {
						delete strings[ filename ];
						return;
					}

					// Sort translations by filename for deterministic output
					const files = Object.keys( strings ).sort();

					// Combine translations from each file grouped by context
					const translations = reduce( files, ( memo, file ) => {
						for ( const context in strings[ file ] ) {
							// Within the same file, sort translations by line
							const sortedTranslations = sortBy(
								strings[ file ][ context ],
								'comments.reference'
							);

							forEach( sortedTranslations, ( translation ) => {
								const { msgctxt = '', msgid } = translation;
								if ( ! memo.hasOwnProperty( msgctxt ) ) {
									memo[ msgctxt ] = {};
								}

								// Merge references if translation already exists
								if ( isSameTranslation( translation, memo[ msgctxt ][ msgid ] ) ) {
									translation.comments.reference = uniq( [
										memo[ msgctxt ][ msgid ].comments.reference,
										translation.comments.reference,
									].join( '\n' ).split( '\n' ) ).join( '\n' );
								}

								memo[ msgctxt ][ msgid ] = translation;
							} );
						}

						return memo;
					}, {} );

					// Merge translations from individual files into headers
					const data = merge( {}, baseData, { translations } );

					// Ideally we could wait until Babel has finished parsing
					// all files or at least asynchronously write, but the
					// Babel loader doesn't expose these entry points and async
					// write may hit file lock (need queue).
					const compiled = po.compile( data );
					writeFileSync( state.opts.output || DEFAULT_OUTPUT, compiled );
					this.hasPendingWrite = false;
				},
			},
		},
	};
};

module.exports.getNodeAsString = getNodeAsString;
module.exports.getTranslatorComment = getTranslatorComment;
module.exports.isValidTranslationKey = isValidTranslationKey;
module.exports.isSameTranslation = isSameTranslation;
