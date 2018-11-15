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


module.exports = function () {
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
					const msgid_plural = getNodeAsString( path.node.arguments[i] ).length;
					if ( msgid_plural ) {
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

		}
	};
};

