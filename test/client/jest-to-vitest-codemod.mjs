// Rewrites Jest tests for Vitest: `jest.*` calls and types become Vitest's,
// `jest.requireActual()` becomes `await vi.importActual()` (making its function async), and
// `@jest-environment` and `@jest-environment-options` comments become their `@vitest-` forms. Safe
// to re-run on converted files.
//
//   node test/client/jest-to-vitest-codemod.mjs [files…]
//
// With no files, it converts the client test files that `test/client/vitest-directories.js` moves
// to Vitest, and the helpers next to them. It prints the files and lines that need a hand fix.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve( import.meta.dirname, '../..' );
const client = path.join( root, 'client' );
const { eslintFiles, eslintIgnores } = createRequire( import.meta.url )(
	'./vitest-directories.js'
);
const args = process.argv.slice( 2 );
const files = args.length
	? args
	: fs
			.globSync( eslintFiles, { cwd: client, exclude: eslintIgnores } )
			.map( ( file ) => path.join( client, file ) );

const SOURCE_EXTENSIONS = [
	'',
	'.js',
	'.jsx',
	'.ts',
	'.tsx',
	'/index.js',
	'/index.jsx',
	'/index.ts',
	'/index.tsx',
];

// The file a bare specifier loads, preferring workspace packages' `calypso:src` source.
function resolvePackage( specifier, fromFile ) {
	const parts = specifier.split( '/' );
	const name = parts.slice( 0, specifier.startsWith( '@' ) ? 2 : 1 ).join( '/' );
	const subpath = specifier.slice( name.length );
	for ( let dir = path.dirname( fromFile ); ; dir = path.dirname( dir ) ) {
		const pkgDir = path.join( dir, 'node_modules', name );
		const manifest = path.join( pkgDir, 'package.json' );
		if ( fs.existsSync( manifest ) ) {
			const pkg = JSON.parse( fs.readFileSync( manifest, 'utf8' ) );
			let entry = pkg.exports?.[ '.' + subpath ] ?? ( subpath ? undefined : pkg.exports );
			while ( entry && typeof entry === 'object' ) {
				entry = entry[ 'calypso:src' ] ?? entry.import ?? entry.default ?? entry.require;
			}
			entry ??= subpath ? '.' + subpath : ( pkg.module ?? pkg.main ?? 'index.js' );
			return path.join( pkgDir, entry );
		}
		if ( dir === path.dirname( dir ) ) {
			return null;
		}
	}
}

// Whether the mocked module has a default export a consumer could import. Modules it can't find
// count as having one.
const defaultExportCache = new Map();
function hasDefaultExport( specifier, fromFile ) {
	let base;
	if ( specifier.startsWith( '.' ) ) {
		base = path.resolve( path.dirname( fromFile ), specifier );
	} else if ( specifier.startsWith( 'calypso/' ) ) {
		base = path.join( client, specifier.slice( 'calypso/'.length ) );
	} else {
		base = resolvePackage( specifier, path.resolve( fromFile ) );
	}
	const file =
		base &&
		SOURCE_EXTENSIONS.map( ( ext ) => base + ext ).find( ( f ) =>
			fs.statSync( f, { throwIfNoEntry: false } )?.isFile()
		);
	if ( ! file ) {
		return true;
	}
	if ( ! defaultExportCache.has( file ) ) {
		const code = fs.readFileSync( file, 'utf8' );
		defaultExportCache.set(
			file,
			/\bexport\s+default\b|\bexport\s*\{[^}]*(\bas\s+default\b|\bdefault\s*[,}])|\bexports\.default\b|\bdefault:\s*\(\)\s*=>/.test(
				code
			) ||
				// CommonJS without the `__esModule` marker: Babel imports `module.exports` as the default.
				( /\b(module\.)?exports\b/.test( code ) &&
					! /^\s*(import|export)\b/m.test( code ) &&
					! code.includes( '__esModule' ) )
		);
	}
	return defaultExportCache.get( file );
}

const TYPE_RENAMES = {
	Mock: 'Mock',
	Mocked: 'Mocked',
	MockedFunction: 'MockedFunction',
	MockedClass: 'MockedClass',
	MockedObject: 'MockedObject',
	SpyInstance: 'MockInstance',
	SpiedFunction: 'MockInstance',
	MockInstance: 'MockInstance',
	Func: 'Procedure',
};

const TIMER_OPTION_RENAMES = { advanceTimers: 'shouldAdvanceTime', doNotFake: 'toNotFake' };

let changedFiles = 0;
const handFixes = [];

for ( const file of files ) {
	const src = fs.readFileSync( file, 'utf8' );
	const kind = file.endsWith( 'x' ) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
	const isTypeScript = /\.tsx?$/.test( file );
	const sf = ts.createSourceFile( file, src, ts.ScriptTarget.Latest, true, kind );
	const edits = [];
	const vitestImports = new Set();
	const lineOf = ( node ) => sf.getLineAndCharacterOfPosition( node.getStart( sf ) ).line + 1;
	const flag = ( node, why ) => handFixes.push( `${ file }:${ lineOf( node ) } ${ why }` );

	const isJest = ( node ) => ts.isIdentifier( node ) && node.text === 'jest';

	const enclosingFunction = ( node ) => {
		for ( let n = node.parent; n; n = n.parent ) {
			if (
				ts.isArrowFunction( n ) ||
				ts.isFunctionExpression( n ) ||
				ts.isFunctionDeclaration( n )
			) {
				return n;
			}
		}
		return null;
	};
	const isMockCall = ( node ) =>
		ts.isCallExpression( node ) &&
		ts.isPropertyAccessExpression( node.expression ) &&
		ts.isIdentifier( node.expression.expression ) &&
		[ 'jest', 'vi' ].includes( node.expression.expression.text ) &&
		node.expression.name.text === 'mock';
	const isMockFactory = ( fn ) =>
		fn && fn.parent && isMockCall( fn.parent ) && fn.parent.arguments[ 1 ] === fn;
	const isTestCallback = ( fn ) =>
		ts.isCallExpression( fn.parent ) &&
		/^(it|test|beforeEach|afterEach|beforeAll|afterAll)$/.test(
			fn.parent.expression.getText( sf ).split( '.' )[ 0 ]
		);
	const unwrap = ( e ) => ( ts.isParenthesizedExpression( e ) ? unwrap( e.expression ) : e );
	const isDynamicImport = ( e ) =>
		ts.isCallExpression( e ) && e.expression.kind === ts.SyntaxKind.ImportKeyword;
	// `jest.requireActual()` already returns an object of exports.
	const isRequireActual = ( e ) =>
		ts.isCallExpression( e ) &&
		ts.isPropertyAccessExpression( e.expression ) &&
		isJest( e.expression.expression ) &&
		e.expression.name.text === 'requireActual';

	// Without `__esModule`, Babel's interop gives Jest's default import the whole object of
	// exports, where Vitest has no default export. Only `jest.mock()` factories are wrapped, so
	// re-runs leave converted files alone.
	const addInteropDefault = ( call, e ) => {
		const keys = e.properties.map( ( p ) => p.name?.getText( sf ) );
		const [ specifier ] = call.arguments;
		if (
			! isJest( call.expression.expression ) ||
			! ts.isStringLiteralLike( specifier ) ||
			! hasDefaultExport( specifier.text, file ) ||
			keys.includes( 'default' ) ||
			keys.includes( '__esModule' ) ||
			e.properties.some( ts.isSpreadAssignment )
		) {
			return;
		}
		edits.push( {
			start: e.getStart( sf ),
			end: e.getStart( sf ),
			text: '( ( m ) => ( { ...m, default: m } ) )( ',
		} );
		edits.push( { start: e.end, end: e.end, text: ' )' } );
	};

	// Jest lets a factory return the module itself (e.g. a function, read through the default
	// import); Vitest needs an object of exports.
	const wrapNonObjectFactory = ( call ) => {
		const factory = call.arguments[ 1 ];
		if ( ! factory || ! ( ts.isArrowFunction( factory ) || ts.isFunctionExpression( factory ) ) ) {
			return;
		}
		if ( ts.isBlock( factory.body ) ) {
			for ( const r of factory.body.statements.filter( ts.isReturnStatement ) ) {
				const e = r.expression && unwrap( r.expression );
				if ( e && ts.isObjectLiteralExpression( e ) ) {
					addInteropDefault( call, e );
					continue;
				}
				if ( ! e || isRequireActual( e ) || isDynamicImport( e ) ) {
					continue;
				}
				// `Object.assign( fn, { default: fn, … } )`: copy its exports onto a plain object.
				const hasDefault =
					ts.isCallExpression( e ) &&
					e.expression.getText( sf ) === 'Object.assign' &&
					e.arguments.some(
						( a ) =>
							ts.isObjectLiteralExpression( a ) &&
							a.properties.some( ( p ) => p.name?.getText( sf ) === 'default' )
					);
				if ( hasDefault ) {
					edits.push( {
						start: r.expression.getStart( sf ),
						end: r.expression.getStart( sf ),
						text: '{ ...',
					} );
					edits.push( { start: r.expression.end, end: r.expression.end, text: ' }' } );
				} else {
					edits.push( {
						start: r.expression.getStart( sf ),
						end: r.expression.getStart( sf ),
						text: '{ default: ',
					} );
					edits.push( { start: r.expression.end, end: r.expression.end, text: ' }' } );
				}
			}
			return;
		}
		const body = unwrap( factory.body );
		// `() => require( './mock' )` loads the mock module with its exports.
		if ( ts.isCallExpression( body ) && body.expression.getText( sf ) === 'require' ) {
			edits.push( {
				start: body.expression.getStart( sf ),
				end: body.expression.end,
				text: 'import',
			} );
			return;
		}
		if ( ts.isObjectLiteralExpression( body ) ) {
			addInteropDefault( call, body );
			return;
		}
		if (
			ts.isAwaitExpression( unwrap( factory.body ) ) ||
			isDynamicImport( unwrap( factory.body ) ) ||
			isRequireActual( unwrap( factory.body ) )
		) {
			return;
		}
		edits.push( {
			start: factory.body.getStart( sf ),
			end: factory.body.getStart( sf ),
			text: '( { default: ',
		} );
		edits.push( { start: factory.body.end, end: factory.body.end, text: ' } )' } );
		vitestImports.add( 'vi' );
	};
	// Jest's mock generics are `< Return, Args >`; Vitest's take the function type.
	const toFunctionTypeArguments = ( typeArguments ) => {
		if ( typeArguments?.length !== 2 ) {
			return;
		}
		const [ returns, parameters ] = typeArguments.map( ( t ) => t.getText( sf ) );
		edits.push( {
			start: typeArguments.pos,
			end: typeArguments.end,
			text: ` ( ...args: ${ parameters } ) => ${ returns } `,
		} );
	};
	const isAsync = ( fn ) => fn.modifiers?.some( ( m ) => m.kind === ts.SyntaxKind.AsyncKeyword );
	const madeAsync = new Set();

	const typeByPath = ( call ) => {
		const [ arg ] = call.arguments;
		if ( isTypeScript && ! call.typeArguments && arg && ts.isStringLiteral( arg ) ) {
			const at = call.expression.end;
			edits.push( { start: at, end: at, text: `< typeof import( '${ arg.text }' ) >` } );
		}
	};

	const visit = ( node ) => {
		// Vitest has no `%p` in `.each` titles; `%o` formats values the same way.
		if (
			ts.isCallExpression( node ) &&
			ts.isCallExpression( node.expression ) &&
			ts.isPropertyAccessExpression( node.expression.expression ) &&
			node.expression.expression.name.text === 'each'
		) {
			const [ title ] = node.arguments;
			if (
				title &&
				( ts.isStringLiteral( title ) || ts.isNoSubstitutionTemplateLiteral( title ) ) &&
				title.text.includes( '%p' )
			) {
				edits.push( {
					start: title.getStart( sf ),
					end: title.end,
					text: title.getText( sf ).replaceAll( '%p', '%o' ),
				} );
			}
		}
		if ( isMockCall( node ) ) {
			wrapNonObjectFactory( node );
			// Vitest has no virtual mocks; it mocks any specifier it's given.
			const opts = node.arguments[ 2 ];
			if (
				opts &&
				ts.isObjectLiteralExpression( opts ) &&
				/^\{\s*virtual:\s*true\s*,?\s*\}$/.test( opts.getText( sf ) )
			) {
				edits.push( { start: node.arguments[ 1 ].end, end: opts.end, text: '' } );
			}
		}
		if (
			ts.isCallExpression( node ) &&
			ts.isPropertyAccessExpression( node.expression ) &&
			ts.isIdentifier( node.expression.expression ) &&
			node.expression.expression.text === 'vi' &&
			node.expression.name.text === 'importActual'
		) {
			typeByPath( node );
		}
		// Vitest's types require the implementation that Jest's let tests leave out.
		if (
			ts.isCallExpression( node ) &&
			ts.isPropertyAccessExpression( node.expression ) &&
			[ 'mockImplementation', 'mockImplementationOnce' ].includes( node.expression.name.text ) &&
			node.arguments.length === 0
		) {
			edits.push( { start: node.arguments.pos, end: node.arguments.pos, text: '() => {}' } );
		}
		if ( ts.isPropertyAccessExpression( node ) && isJest( node.expression ) ) {
			const name = node.name.text;
			if ( name === 'requireActual' && ts.isCallExpression( node.parent ) ) {
				const call = node.parent;
				const fn = enclosingFunction( call );
				if ( fn && ! isMockFactory( fn ) && ! isTestCallback( fn ) && ! isAsync( fn ) ) {
					flag( call, 'requireActual inside a function that is neither a factory nor a test' );
				} else {
					if ( fn && ! isAsync( fn ) && ! madeAsync.has( fn ) ) {
						madeAsync.add( fn );
						edits.push( { start: fn.getStart( sf ), end: fn.getStart( sf ), text: 'async ' } );
					}
					edits.push( { start: call.getStart( sf ), end: call.getStart( sf ), text: '( await ' } );
					edits.push( { start: node.getStart( sf ), end: node.end, text: 'vi.importActual' } );
					typeByPath( call );
					edits.push( { start: call.end, end: call.end, text: ' )' } );
					vitestImports.add( 'vi' );
				}
			} else if ( name === 'requireMock' && ts.isCallExpression( node.parent ) ) {
				const call = node.parent;
				if ( enclosingFunction( call ) ) {
					flag( call, 'requireMock inside a function' );
				} else {
					// Top-level `await import()` returns the mocked module.
					edits.push( { start: call.getStart( sf ), end: call.getStart( sf ), text: '( await ' } );
					edits.push( { start: node.getStart( sf ), end: node.end, text: 'import' } );
					edits.push( {
						start: call.end,
						end: call.end,
						text: ts.isAsExpression( call.parent ) ? ' ) as unknown' : ' )',
					} );
				}
			} else if (
				name === 'setTimeout' &&
				ts.isCallExpression( node.parent ) &&
				node.parent.arguments.length === 1
			) {
				const [ timeout ] = node.parent.arguments;
				edits.push( { start: node.getStart( sf ), end: node.end, text: 'vi.setConfig' } );
				edits.push( {
					start: timeout.getStart( sf ),
					end: timeout.getStart( sf ),
					text: '{ testTimeout: ',
				} );
				edits.push( { start: timeout.end, end: timeout.end, text: ' }' } );
				vitestImports.add( 'vi' );
			} else {
				edits.push( {
					start: node.expression.getStart( sf ),
					end: node.expression.end,
					text: 'vi',
				} );
				vitestImports.add( 'vi' );
				if ( name === 'fn' && ts.isCallExpression( node.parent ) ) {
					toFunctionTypeArguments( node.parent.typeArguments );
				}
				if ( name === 'useFakeTimers' && ts.isCallExpression( node.parent ) ) {
					const [ opts ] = node.parent.arguments;
					if ( opts && ts.isObjectLiteralExpression( opts ) ) {
						for ( const p of opts.properties ) {
							const renamed = p.name && TIMER_OPTION_RENAMES[ p.name.getText( sf ) ];
							if ( renamed ) {
								edits.push( { start: p.name.getStart( sf ), end: p.name.end, text: renamed } );
							}
						}
					}
				}
				if (
					name === 'restoreAllMocks' ||
					( name === 'mock' &&
						ts.isCallExpression( node.parent ) &&
						node.parent.arguments.length === 1 )
				) {
					flag( node, `jest.${ name } semantics differ in Vitest` );
				}
			}
		} else if ( ts.isQualifiedName( node ) && isJest( node.left ) ) {
			const renamed = TYPE_RENAMES[ node.right.text ];
			if ( renamed ) {
				edits.push( { start: node.getStart( sf ), end: node.end, text: renamed } );
				vitestImports.add( `type ${ renamed }` );
				if ( ts.isTypeReferenceNode( node.parent ) ) {
					toFunctionTypeArguments( node.parent.typeArguments );
				}
			} else {
				flag( node, `unknown jest type ${ node.getText( sf ) }` );
			}
			return;
		} else if ( isJest( node ) && ! ts.isPropertyAccessExpression( node.parent ) ) {
			flag( node, 'bare jest reference' );
		}
		ts.forEachChild( node, visit );
	};
	visit( sf );

	const docblock = sf.statements.length ? sf.statements[ 0 ].getFullStart() : 0;
	const leadingComments = ts.getLeadingCommentRanges( src, docblock ) ?? [];
	for ( const comment of leadingComments ) {
		const text = src.slice( comment.pos, comment.end );
		for ( const match of text.matchAll( /@jest-environment(\s+)(\S+)/g ) ) {
			const at = comment.pos + match.index;
			// Vitest shares the real `process.env`, so setting `TZ` in a test already works there.
			const environment = match[ 2 ].endsWith( '/jest-environment-timezone.js' )
				? 'jsdom'
				: match[ 2 ];
			edits.push( {
				start: at,
				end: at + match[ 0 ].length,
				text: `@vitest-environment${ match[ 1 ] }${ environment }`,
			} );
		}
		for ( const match of text.matchAll( /@jest-environment-options\b/g ) ) {
			const at = comment.pos + match.index;
			edits.push( {
				start: at,
				end: at + match[ 0 ].length,
				text: '@vitest-environment-options',
			} );
		}
	}

	if ( ! edits.length ) {
		continue;
	}

	const existing = sf.statements.find(
		( s ) => ts.isImportDeclaration( s ) && s.moduleSpecifier.text === 'vitest'
	);
	const existingNames = existing?.importClause?.namedBindings?.elements?.map( ( e ) =>
		e.isTypeOnly ? `type ${ e.name.text }` : e.name.text
	);
	if ( existing ) {
		const missing = [ ...vitestImports ].filter( ( n ) => ! existingNames.includes( n ) );
		if ( missing.length ) {
			const els = existing.importClause.namedBindings.elements;
			edits.push( { start: els.end, end: els.end, text: ', ' + missing.join( ', ' ) } );
		}
	} else if ( vitestImports.size ) {
		const names = [ ...vitestImports ].sort( ( a, b ) =>
			a.replace( 'type ', '' ).localeCompare( b.replace( 'type ', '' ) )
		);
		// After the last external value import, so `eslint --fix` can sort it into place (it won't
		// move imports across a side-effect import such as `import '@testing-library/jest-dom'`).
		const lastExternal = sf.statements
			.filter(
				( s ) =>
					ts.isImportDeclaration( s ) &&
					s.importClause &&
					s.importClause.phaseModifier !== ts.SyntaxKind.TypeKeyword &&
					! /^(\.|calypso\/)/.test( s.moduleSpecifier.text )
			)
			.pop();
		let at;
		let text = `import { ${ names.join( ', ' ) } } from 'vitest';\n`;
		if ( lastExternal ) {
			at = lastExternal.end;
			text = '\n' + text.trimEnd();
		} else {
			at = sf.statements.length ? sf.statements[ 0 ].getStart( sf ) : 0;
		}
		edits.push( { start: at, end: at, text } );
	}

	let out = src;
	edits
		.map( ( e, i ) => ( { ...e, i } ) )
		.sort( ( a, b ) => b.start - a.start || b.end - a.end || b.i - a.i )
		.forEach( ( e ) => {
			out = out.slice( 0, e.start ) + e.text + out.slice( e.end );
		} );
	fs.writeFileSync( file, out );
	changedFiles++;
}

console.log( `Changed ${ changedFiles } of ${ files.length } files` );
if ( handFixes.length ) {
	console.log( `\nNeeds a hand fix (${ handFixes.length }):` );
	handFixes.forEach( ( h ) => console.log( '  ' + h ) );
}
