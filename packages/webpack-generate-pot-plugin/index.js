/**
 * External Dependencies
 */
const ConstDependency = require( 'webpack/lib/dependencies/ConstDependency' );
const NullFactory = require( 'webpack/lib/NullFactory' );
const { po } = require( 'gettext-parser' );
const { merge, isEmpty } = require( 'lodash' );
const { relative, sep } = require( 'path' );
const { writeFileSync } = require( 'fs' );

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
			return getNodeAsString( node.left ) + getNodeAsString( node.right );

		case 'Literal':
			return node.value;

		default:
			return '';
	}
}

class GeneratePotPlugin {
	constructor() {}

	apply( compiler ) {
		const strings = {};
		let nplurals = 2;
		let baseData;

		const handleCompilation = ( compilation, { normalModuleFactory } ) => {
			compilation.dependencyFactories.set( ConstDependency, new NullFactory() );
			compilation.dependencyTemplates.set( ConstDependency, new ConstDependency.Template() );

			const handler = ( parser, parserOptions ) => {
				const processCall = call => {
					const { callee } = call;

					// Determine function name by direct invocation or property name
					let name;
					if ( 'MemberExpression' === callee.type ) {
						name = callee.property.name;
					} else {
						name = callee.name;
					}

					if ( '__' !== name && '_x' !== name && '_n' !== name && 'translate' !== name ) {
						return;
					}
					let i = 0;

					const translation = {
						msgid: getNodeAsString( call.arguments[ i++ ] ),
						msgstr: '',
						comments: {},
						reference: {},
					};

					if ( ! translation.msgid.length ) {
						return;
					}

					// At this point we assume we'll save data, so initialize if
					// we haven't already
					if ( ! baseData ) {
						baseData = {
							charset: 'utf-8',
							headers: [],
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

					if ( call.arguments.length > i ) {
						if ( '_x' === name ) {
							translation.msgctxt = getNodeAsString( call.arguments[ i ] );
							i++;
						} else if ( '_n' === name || 'translate' === name ) {
							const msgid_plural = getNodeAsString( call.arguments[ i ] );
							if ( msgid_plural.length ) {
								translation.msgid_plural = msgid_plural;
								i++;
								// For plurals, create an empty mgstr array
								translation.msgstr = Array.from( Array( nplurals ) ).map( () => '' );
							}
						}
					}

					if (
						'translate' === name &&
						call.arguments.length > i &&
						'ObjectExpression' === call.arguments[ i ].type
					) {
						for ( const j in call.arguments[ i ].properties ) {
							if ( 'ObjectProperty' === call.arguments[ i ].properties[ j ].type ) {
								switch ( call.arguments[ i ].properties[ j ].key.name ) {
									case 'context':
										translation.msgctxt = call.arguments[ i ].properties[ j ].value.value;
										break;
									case 'comment':
										translation.comments.extracted =
											call.arguments[ i ].properties[ j ].value.value;
										break;
								}
							}
						}
					}
					const filename = parser.state.current.userRequest;
					const pathname = relative( '.', filename )
						.split( sep )
						.join( '/' );
					translation.comments.reference = pathname + ':' + call.loc.start.line;
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
				parser.hooks.call.for( 'imported var' ).tap( 'GeneratePotPlugin', processCall );
				parser.hooks.callAnyMember.for( 'imported var' ).tap( 'GeneratePotPlugin', processCall );

				return true;
			};

			normalModuleFactory.hooks.parser.for( 'javascript/auto' ).tap( 'GeneratePotPlugin', handler );
		};

		const saveFile = () => {
			if ( isEmpty( strings ) ) {
				return;
			}

			const data = merge( {}, baseData, { translations: strings } );

			const compiled = po.compile( data );

			writeFileSync( 'out.pot', compiled );
		};

		compiler.hooks.compilation.tap( 'GeneratePotPlugin', handleCompilation );
		compiler.hooks.emit.tap( 'GeneratePotPlugin', saveFile );
	}
}
module.exports = GeneratePotPlugin;
