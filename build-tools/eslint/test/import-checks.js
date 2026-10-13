/**
 * @jest-environment node
 */
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
