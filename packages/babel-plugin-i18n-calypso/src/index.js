/**
 * Extract i18n-calypso `translate` calls into a POT file.
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
const { merge, isEmpty } = require( 'lodash' );
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

		default:
			return '';
	}
}

module.exports = function() {
	let strings = {},
		nplurals = 2,
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
				if ( 'translate' !== name ) {
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

				if ( path.node.arguments.length > i ) {
					const msgid_plural = getNodeAsString( path.node.arguments[ i ] );
					if ( msgid_plural.length ) {
						translation.msgid_plural = msgid_plural;
						i++;
						// For plurals, create an empty mgstr array
						translation.msgstr = Array.from( Array( nplurals ) ).map( () => '' );
					}
				}

				const { filename } = this.file.opts;
				const pathname = relative( '.', filename )
					.split( sep )
					.join( '/' );
				translation.comments.reference = pathname + ':' + path.node.loc.start.line;

				if (
					path.node.arguments.length > i &&
					'ObjectExpression' === path.node.arguments[ i ].type
				) {
					for ( const j in path.node.arguments[ i ].properties ) {
						if ( 'ObjectProperty' === path.node.arguments[ i ].properties[ j ].type ) {
							switch ( path.node.arguments[ i ].properties[ j ].key.name ) {
								case 'context':
									translation.msgctxt = path.node.arguments[ i ].properties[ j ].value.value;
									break;
								case 'comment':
									translation.comments.extracted =
										path.node.arguments[ i ].properties[ j ].value.value;
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
					strings[ msgctxt ][ msgid ].comments.reference += '\n' + translation.comments.reference;
				}
			},
			Program: {
				enter() {
					strings = {};
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
					const pathname = relative( '.', filename )
						.split( sep )
						.join( '-' );
					writeFileSync( dir + pathname + '.pot', compiled );
				},
			},
		},
	};
};
