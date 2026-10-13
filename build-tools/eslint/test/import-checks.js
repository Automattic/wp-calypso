/**
 * @jest-environment node
 */
const fs = require( 'fs' );
const path = require( 'path' );
const { loadESLint } = require( 'eslint' );

const repoRoot = path.resolve( __dirname, '../../..' );

// Without this, broken imports of workspace packages pass lint whenever packages aren't built.
test( 'import rules check workspace packages from source', async () => {
	const ESLint = await loadESLint( { useFlatConfig: false } );
	const eslint = new ESLint( { cwd: repoRoot } );
	const code = [
		"import { isJetpackBackupSlug, missingExport } from '@automattic/calypso-products';",
		"import { missingApiExport } from '@automattic/api-core';",
		"import { clsx, missingClsxExport } from 'clsx';",
		'export default [ isJetpackBackupSlug, missingExport, missingApiExport, clsx, missingClsxExport ];',
	].join( '\n' );

	const [ result ] = await eslint.lintText( code, {
		filePath: path.join( repoRoot, 'client/import-checks-fixture.js' ),
	} );

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
		.filter( ( { pkg } ) => pkg.scripts?.prepare )
		.filter(
			( { dir, pkg } ) =>
				! pkg[ 'calypso:src' ] || ! fs.existsSync( path.join( dir, pkg[ 'calypso:src' ] ) )
		)
		.map( ( { pkg } ) => pkg.name );

	expect( withoutSource ).toEqual( [
		// Published from built output only; no JavaScript file imports them.
		'@automattic/agenttic-client',
		'@automattic/agenttic-ui',
		// A stylesheet package with nothing for import rules to check.
		'@automattic/calypso-color-schemes',
	] );
} );
