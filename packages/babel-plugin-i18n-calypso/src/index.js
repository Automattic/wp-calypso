/**
 * Extract i18n-calypso `translate` and @wordpress/i18n `__`, `_n`, `_x`, `_nx`
 * calls into a POT file.
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
 *
 */

/**
 * External dependencies
 */
const { po } = require( 'gettext-parser' );
const { merge, isEmpty, forEach } = require( 'lodash' );
const { relative, sep } = require( 'path' );
const { existsSync, mkdirSync, writeFileSync } = require( 'fs' );

/**
 * Default output headers if none specified in plugin options.
 *
 * @type {object}
 */
const DEFAULT_HEADERS = {
	'content-type': 'text/plain; charset=UTF-8',
	'x-generator': 'babel-plugin-i18n-calypso',
};

/**
 * Default directory to output the POT files.
 *
 * @type {string}
 */
const DEFAULT_DIR = 'build/';

/**
 * The order of arguments in translate functions.
 *
 * @type {object}
 */
const DEFAULT_FUNCTIONS_ARGUMENTS_ORDER = {
	__: [],
	_n: [ 'msgid_plural' ],
	_x: [ 'msgctxt' ],
	_nx: [ 'msgid_plural', null, 'msgctxt' ],
	translate: [ 'msgid_plural', 'options_object' ],
};

/**
 * Regular expression matching translator comment value.
 *
 * @type {RegExp}
 */
const REGEXP_TRANSLATOR_COMMENT = /^\s*translators:\s*([\s\S]+)/im;

/**
 * Returns the extracted comment for a given AST traversal path if one exists.
 *
 * @param {object} path              Traversal path.
 * @param {number} _originalNodeLine Private: In recursion, line number of
 *                                     the original node passed.
 *
 * @returns {?string} Extracted comment.
 */
function getExtractedComment( path, _originalNodeLine ) {
	const { node, parent, parentPath } = path;

	// Assign original node line so we can keep track in recursion whether a
	// matched comment or parent occurs on the same or previous line
	if ( ! _originalNodeLine ) {
		_originalNodeLine = node.loc.start.line;
	}

	let comment;
	forEach( node.leadingComments, commentNode => {
		const { line } = commentNode.loc.end;
		if ( line < _originalNodeLine - 1 || line > _originalNodeLine ) {
			return;
		}

		const match = commentNode.value.match( REGEXP_TRANSLATOR_COMMENT );
		if ( match ) {
			// Extract text from matched translator prefix
			comment = match[ 1 ]
				.split( '\n' )
				.map( text => text.trim() )
				.join( ' ' );

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
		return getExtractedComment( parentPath, _originalNodeLine );
	}
}

/**
 * Given an argument node (or recursed node), attempts to return a string
 * represenation of that node's value.
 *
 * @param {object} node AST node.
 *
 * @returns {string} String value.
 */
function getNodeAsString( node ) {
	if ( undefined === node ) {
		return '';
	}

	switch ( node.type ) {
		case 'BinaryExpression':
			return getNodeAsString( node.left ) + getNodeAsString( node.right );

		case 'StringLiteral':
			return node.value;

		case 'TemplateLiteral':
			return ( node.quasis || [] ).reduce( ( string, element ) => {
				return ( string += element.value.cooked );
			}, '' );

		default:
			return '';
	}
}

/**
 * Returns true if the specified funciton name is valid translate function name
 *
 * @param {string} name Function name to test.
 *
 * @returns {boolean} Whether function name is valid translate function name.
 */
function isValidFunctionName( name ) {
	return Object.keys( DEFAULT_FUNCTIONS_ARGUMENTS_ORDER ).includes( name );
}

/**
 * Returns true if the specified key of a function is valid for assignment in
 * the translation object.
 *
 * @param {string} key Key to test.
 *
 * @returns {boolean} Whether key is valid for assignment.
 */
function isValidTranslationKey( key ) {
	return Object.values( DEFAULT_FUNCTIONS_ARGUMENTS_ORDER ).some( args => args.includes( key ) );
}

module.exports = function() {
	let strings = {},
		nplurals = 2,
		baseData,
		functions = { ...DEFAULT_FUNCTIONS_ARGUMENTS_ORDER };

	return {
		visitor: {
			ImportDeclaration( path ) {
				// If `translate` from  `i18n-calypso` is imported with an
				// alias, set the specified alias as a reference to translate.
				if ( 'i18n-calypso' !== path.node.source.value ) {
					return;
				}

				path.node.specifiers.forEach( specifier => {
					if ( specifier.imported && 'translate' === specifier.imported.name && specifier.local ) {
						functions[ specifier.local.name ] = functions.translate;
					}
				} );
			},

			CallExpression( path, state ) {
				const { callee } = path.node;

				// Determine function name by direct invocation or property name
				let name;
				if ( 'MemberExpression' === callee.type ) {
					name = callee.property.loc ? callee.property.loc.identifierName : callee.property.name;
				} else {
					name = callee.loc ? callee.loc.identifierName : callee.name;
				}
				if ( ! isValidFunctionName( name ) ) {
					return;
				}
				let i = 0;

				const translation = {
					msgid: getNodeAsString( path.node.arguments[ i++ ] ),
					msgstr: '',
					comments: {},
				};

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
						baseData.translations[ '' ][ '' ].msgstr.push(
							`${ key }: ${ baseData.headers[ key ] };\n`
						);
					}

					// Attempt to exract nplurals from header
					const pluralsMatch = ( baseData.headers[ 'plural-forms' ] || '' ).match(
						/nplurals\s*=\s*(\d+);/
					);
					if ( pluralsMatch ) {
						nplurals = pluralsMatch[ 1 ];
					}
				}

				// If exists, also assign translator comment
				const translator = getExtractedComment( path );
				if ( translator ) {
					translation.comments.extracted = translator;
				}

				const { filename } = this.file.opts;
				const base = state.opts.base || '.';
				const pathname = relative( base, filename )
					.split( sep )
					.join( '/' );
				translation.comments.reference = pathname + ':' + path.node.loc.start.line;

				const functionKeys = state.opts.functions || functions[ name ];

				if ( functionKeys ) {
					path.node.arguments.slice( i ).forEach( ( arg, index ) => {
						const key = functionKeys[ index ];

						if ( 'ObjectExpression' === arg.type ) {
							arg.properties.forEach( property => {
								if ( 'ObjectProperty' !== property.type ) {
									return;
								}

								if ( 'context' === property.key.name ) {
									translation.msgctxt = property.value.value;
								}

								if ( 'comment' === property.key.name ) {
									translation.comments.extracted = property.value.value;
								}
							} );
						} else if ( isValidTranslationKey( key ) ) {
							translation[ key ] = getNodeAsString( arg );
						}
					} );
				}

				// For plurals, create an empty mgstr array
				if ( ( translation.msgid_plural || '' ).length ) {
					translation.msgstr = Array.from( Array( nplurals ) ).map( () => '' );
				}

				// Create context grouping for translation if not yet exists
				const { msgctxt = '', msgid } = translation;
				if ( ! strings.hasOwnProperty( msgctxt ) ) {
					strings[ msgctxt ] = {};
				}

				if ( ! strings[ msgctxt ].hasOwnProperty( msgid ) ) {
					strings[ msgctxt ][ msgid ] = translation;
				} else if (
					! strings[ msgctxt ][ msgid ].comments.reference.includes(
						translation.comments.reference
					)
				) {
					strings[ msgctxt ][ msgid ].comments.reference += '\n' + translation.comments.reference;
				}
			},
			Program: {
				enter() {
					strings = {};
					functions = { ...DEFAULT_FUNCTIONS_ARGUMENTS_ORDER };
				},
				exit( path, state ) {
					if ( isEmpty( strings ) ) {
						return;
					}

					const data = merge( {}, baseData, { translations: strings } );

					const compiled = po.compile( data );

					const dir = state.opts.dir || DEFAULT_DIR;
					! existsSync( dir ) && mkdirSync( dir, { recursive: true } );

					const { filename } = this.file.opts;
					const base = state.opts.base || '.';
					const pathname = relative( base, filename )
						.split( sep )
						.join( '-' );
					writeFileSync( dir + pathname + '.pot', compiled );
				},
			},
		},
	};
};
