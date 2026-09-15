const { transform } = require( '@swc/core' );
const { init: initLexer, parse: parseModule } = require( 'es-module-lexer' );

const I18N_SOURCE = '@wordpress/i18n';
const I18N_FUNCTIONS = new Set( [ '__', '_n', '_nx', '_x' ] );

/**
 * Reimplementation of `@automattic/babel-plugin-preserve-i18n` on top of the
 * transpiled output. Rewrites `import { __ } from '@wordpress/i18n'` into an
 * aliased import plus a module-local constant, so that `__( '…' )` call sites
 * survive webpack scope hoisting and minification (paired with the
 * `mangle.reserved` list in `webpack/minify.js`) and remain extractable by
 * WP i18n tools.
 */
async function preserveI18nCalls( code ) {
	if ( ! code.includes( I18N_SOURCE ) ) {
		return code;
	}

	await initLexer;
	let imports;
	try {
		[ imports ] = parseModule( code );
	} catch {
		return code;
	}

	const edits = [];
	for ( const imp of imports ) {
		if ( code.slice( imp.s, imp.e ) !== I18N_SOURCE || imp.d !== -1 ) {
			continue;
		}
		const statement = code.slice( imp.ss, imp.se );
		if ( statement.startsWith( 'export' ) ) {
			continue;
		}
		const braces = statement.match( /\{([^}]*)\}/ );
		if ( ! braces ) {
			continue;
		}

		const constants = [];
		const specifiers = braces[ 1 ].split( ',' ).map( ( raw ) => {
			const spec = raw.trim();
			if ( ! spec ) {
				return raw;
			}
			const [ imported, , local = imported ] = spec.split( /\s+/ );
			if ( ! I18N_FUNCTIONS.has( imported ) ) {
				return raw;
			}
			constants.push( `const ${ local } = _preserved${ local };` );
			return ` ${ imported } as _preserved${ local }`;
		} );

		if ( constants.length ) {
			const newStatement =
				statement.slice( 0, braces.index ) +
				'{' +
				specifiers.join( ',' ) +
				'}' +
				statement.slice( braces.index + braces[ 0 ].length );
			edits.push( {
				start: imp.ss,
				end: imp.se,
				text: newStatement + '\n' + constants.join( '\n' ),
			} );
		}
	}

	for ( const edit of edits.reverse() ) {
		code = code.slice( 0, edit.start ) + edit.text + code.slice( edit.end );
	}
	return code;
}

module.exports = function ( source, inputSourceMap ) {
	const callback = this.async();
	const options = this.getOptions();
	const isTypescript = /\.tsx?$/.test( this.resourcePath );

	transform( source, {
		filename: this.resourcePath,
		swcrc: false,
		sourceMaps: this.sourceMap,
		inputSourceMap: inputSourceMap && JSON.stringify( inputSourceMap ),
		isModule: options.unambiguous ? 'unknown' : true,
		env: {
			targets: options.targets,
			mode: 'entry',
			coreJs: options.coreJs,
		},
		jsc: {
			parser: isTypescript
				? { syntax: 'typescript', tsx: true }
				: { syntax: 'ecmascript', jsx: true },
			transform: {
				react: {
					runtime: 'automatic',
					importSource: options.importSource,
					refresh: options.refresh,
					development: options.development,
				},
			},
			externalHelpers: false,
		},
	} ).then( async ( output ) => {
		try {
			const code = await preserveI18nCalls( output.code );
			callback( null, code, output.map );
		} catch ( error ) {
			callback( error );
		}
	}, callback );
};
