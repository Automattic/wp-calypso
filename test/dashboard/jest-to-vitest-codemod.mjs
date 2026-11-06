// PROTOTYPE (DOTMSD-1656): Jest → Vitest codemod for the Dashboard tests.
//
//   node test/dashboard/jest-to-vitest-codemod.mjs hybrid <files…>
//     Rewrites only what Vitest can't run through a `globalThis.jest = vi` shim:
//     `jest.mock` → `vi.mock`, `jest.requireActual` → `await vi.importActual` (factory made async).
//   node test/dashboard/jest-to-vitest-codemod.mjs full <files…>
//     Also rewrites every other `jest.*` call and `jest.*` type to Vitest's.
//
// Prints files and lines that need a hand fix.
import fs from 'node:fs';
import ts from 'typescript';

const [ mode, ...files ] = process.argv.slice( 2 );
if ( ! [ 'hybrid', 'full' ].includes( mode ) ) {
	console.error( 'usage: jest-to-vitest-codemod.mjs hybrid|full <files…>' );
	process.exit( 1 );
}

const TYPE_RENAMES = {
	Mock: 'Mock',
	Mocked: 'Mocked',
	MockedFunction: 'MockedFunction',
	MockedClass: 'MockedClass',
	MockedObject: 'MockedObject',
	SpyInstance: 'MockInstance',
	MockInstance: 'MockInstance',
	Func: 'Procedure',
};

const TIMER_OPTION_RENAMES = { advanceTimers: 'shouldAdvanceTime', doNotFake: 'toNotFake' };

let changedFiles = 0;
const handFixes = [];

for ( const file of files ) {
	const src = fs.readFileSync( file, 'utf8' );
	const kind = file.endsWith( 'x' ) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
	const sf = ts.createSourceFile( file, src, ts.ScriptTarget.Latest, true, kind );
	const edits = [];
	const vitestImports = new Set();
	const lineOf = ( node ) => sf.getLineAndCharacterOfPosition( node.getStart( sf ) ).line + 1;
	const flag = ( node, why ) => handFixes.push( `${ file }:${ lineOf( node ) } ${ why }` );

	const isJest = ( node ) => ts.isIdentifier( node ) && node.text === 'jest';
	const isJestCall = ( node, name ) =>
		ts.isCallExpression( node ) &&
		ts.isPropertyAccessExpression( node.expression ) &&
		isJest( node.expression.expression ) &&
		node.expression.name.text === name;

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
	const isMockFactory = ( fn ) =>
		fn && fn.parent && isJestCall( fn.parent, 'mock' ) && fn.parent.arguments[ 1 ] === fn;
	const isAsync = ( fn ) => fn.modifiers?.some( ( m ) => m.kind === ts.SyntaxKind.AsyncKeyword );
	const madeAsync = new Set();

	const visit = ( node ) => {
		if ( ts.isPropertyAccessExpression( node ) && isJest( node.expression ) ) {
			const name = node.name.text;
			if ( name === 'requireActual' && ts.isCallExpression( node.parent ) ) {
				const call = node.parent;
				const fn = enclosingFunction( call );
				if ( fn && ! isMockFactory( fn ) && ! isAsync( fn ) ) {
					flag( call, 'requireActual inside a non-factory function' );
				} else {
					if ( fn && ! isAsync( fn ) && ! madeAsync.has( fn ) ) {
						madeAsync.add( fn );
						edits.push( { start: fn.getStart( sf ), end: fn.getStart( sf ), text: 'async ' } );
					}
					edits.push( { start: call.getStart( sf ), end: call.getStart( sf ), text: '( await ' } );
					edits.push( { start: node.getStart( sf ), end: node.end, text: 'vi.importActual' } );
					edits.push( { start: call.end, end: call.end, text: ' )' } );
					vitestImports.add( 'vi' );
				}
			} else if ( name === 'requireMock' ) {
				flag( node, 'jest.requireMock has no Vitest equivalent' );
			} else if ( name === 'mock' || mode === 'full' ) {
				edits.push( {
					start: node.expression.getStart( sf ),
					end: node.expression.end,
					text: 'vi',
				} );
				vitestImports.add( 'vi' );
				if ( mode === 'full' && name === 'useFakeTimers' && ts.isCallExpression( node.parent ) ) {
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
			if ( mode === 'full' ) {
				const renamed = TYPE_RENAMES[ node.right.text ];
				if ( renamed ) {
					edits.push( { start: node.getStart( sf ), end: node.end, text: renamed } );
					vitestImports.add( `type ${ renamed }` );
				} else {
					flag( node, `unknown jest type ${ node.getText( sf ) }` );
				}
			}
			return;
		} else if (
			mode === 'full' &&
			isJest( node ) &&
			! ts.isPropertyAccessExpression( node.parent )
		) {
			flag( node, 'bare jest reference' );
		}
		ts.forEachChild( node, visit );
	};
	visit( sf );

	if ( ! edits.length ) {
		continue;
	}

	const existing = sf.statements.find(
		( s ) => ts.isImportDeclaration( s ) && s.moduleSpecifier.text === 'vitest'
	);
	if ( existing ) {
		flag( existing, 'already imports vitest; merge imports by hand' );
	} else {
		const names = [ ...vitestImports ].sort( ( a, b ) =>
			a.replace( 'type ', '' ).localeCompare( b.replace( 'type ', '' ) )
		);
		const firstImport = sf.statements.find( ( s ) => ts.isImportDeclaration( s ) );
		const at = firstImport ? firstImport.getStart( sf ) : 0;
		edits.push( {
			start: at,
			end: at,
			text: `import { ${ names.join( ', ' ) } } from 'vitest';\n`,
		} );
	}

	let out = src;
	edits
		.map( ( e, i ) => ( { ...e, i } ) )
		.sort( ( a, b ) => b.start - a.start || b.i - a.i )
		.forEach( ( e ) => {
			out = out.slice( 0, e.start ) + e.text + out.slice( e.end );
		} );
	fs.writeFileSync( file, out );
	changedFiles++;
}

console.log( `${ mode }: changed ${ changedFiles } of ${ files.length } files` );
if ( handFixes.length ) {
	console.log( `\nNeeds a hand fix (${ handFixes.length }):` );
	handFixes.forEach( ( h ) => console.log( '  ' + h ) );
}
