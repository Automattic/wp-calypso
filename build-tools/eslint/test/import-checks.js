/**
 * @jest-environment node
 */
const { spawnSync } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );

const repoRoot = path.resolve( __dirname, '../../..' );

// Without this, broken imports of workspace packages pass lint whenever packages aren't built.
test( 'import rules check workspace packages from source', () => {
	const code = [
		"import { isJetpackBackupSlug, missingExport } from '@automattic/calypso-products';",
		"import { missingApiExport } from '@automattic/api-core';",
		"import { clsx, missingClsxExport } from 'clsx';",
		'export default [ isJetpackBackupSlug, missingExport, missingApiExport, clsx, missingClsxExport ];',
	].join( '\n' );

	// A separate Node process, as in CI: Jest can't require() ES-module plugins such as
	// eslint-plugin-jsdoc without --experimental-vm-modules.
	const eslint = spawnSync(
		process.execPath,
		[
			path.join( repoRoot, 'node_modules/eslint/bin/eslint.js' ),
			'--format=json',
			'--stdin',
			'--stdin-filename',
			path.join( repoRoot, 'client/import-checks-fixture.js' ),
		],
		{
			cwd: repoRoot,
			input: code,
			encoding: 'utf8',
		}
	);
	expect( eslint.error ).toBeUndefined();
	// Exit 1 is the fixture's lint errors; 2 means ESLint itself failed, with the reason in stderr.
	if ( eslint.status !== 1 ) {
		throw new Error( `ESLint exited with ${ eslint.status }:\n${ eslint.stderr }` );
	}
	const [ result ] = JSON.parse( eslint.stdout );

	expect(
		result.messages.filter( ( m ) => m.ruleId === 'import/named' ).map( ( m ) => m.message )
	).toEqual( [
		"missingExport not found in '@automattic/calypso-products'",
		// Re-exported through `export *` across TypeScript files.
		"missingApiExport not found in '@automattic/api-core'",
		// An `.mjs` dependency.
		"missingClsxExport not found in 'clsx'",
	] );
}, 60000 );

// Packages with a build step that need no `calypso:src` entry.
const packagesWithoutSource = new Set( [
	// Published from built output only. Imported only from TypeScript, which checks those
	// imports itself.
	'@automattic/agenttic-client',
	'@automattic/agenttic-ui',
	// A stylesheet package, with nothing for import rules to check.
	'@automattic/calypso-color-schemes',
] );

// Without this, a package that needs a build but has no `calypso:src` entry, or one pointing
// at a missing file, would leave its imports silently unchecked in CI, where packages aren't
// built before linting.
test( 'packages that need a build point to their source', () => {
	const packagesDir = path.join( repoRoot, 'packages' );
	const withoutSource = fs
		.readdirSync( packagesDir )
		.map( ( dir ) => path.join( packagesDir, dir ) )
		.filter( ( dir ) => fs.existsSync( path.join( dir, 'package.json' ) ) )
		.map( ( dir ) => ( {
			dir,
			pkg: JSON.parse( fs.readFileSync( path.join( dir, 'package.json' ), 'utf8' ) ),
		} ) )
		// `yarn build-packages` runs `prepare`, and builds the rest through `tsc --build`.
		.filter( ( { pkg } ) => [ 'prepare', 'build', 'prepack' ].some( ( s ) => pkg.scripts?.[ s ] ) )
		// Without an entry point, nothing imports the package (e.g. a demo app).
		.filter( ( { pkg } ) => pkg.main || pkg.module || pkg.exports )
		.filter( ( { pkg } ) => ! packagesWithoutSource.has( pkg.name ) )
		.filter(
			( { dir, pkg } ) =>
				! pkg[ 'calypso:src' ] || ! fs.existsSync( path.join( dir, pkg[ 'calypso:src' ] ) )
		)
		.map( ( { pkg } ) => pkg.name );

	expect( withoutSource ).toEqual( [] );
} );
