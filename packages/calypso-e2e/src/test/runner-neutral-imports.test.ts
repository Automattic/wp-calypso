import fs from 'fs';
import path from 'path';
import { describe, expect, test } from '@jest/globals';

const sourceRoot = path.resolve( __dirname, '..' );
const forbiddenPlaywrightTestImport =
	/(?:from\s+['"](?:@playwright\/test|playwright\/test)['"])|(?:require\(\s*['"](?:@playwright\/test|playwright\/test)['"]\s*\))/;

/**
 * Recursively lists TypeScript source files outside test directories.
 */
function getSourceFiles( directory: string ): string[] {
	const entries = fs.readdirSync( directory, { withFileTypes: true } );

	return entries.flatMap( ( entry ) => {
		const fullPath = path.join( directory, entry.name );

		if ( entry.isDirectory() ) {
			if ( entry.name === 'test' ) {
				return [];
			}
			return getSourceFiles( fullPath );
		}

		return fullPath.endsWith( '.ts' ) ? [ fullPath ] : [];
	} );
}

describe( 'calypso-e2e shared package imports', function () {
	test( 'does not import Playwright Test from shared runtime files', function () {
		const filesWithPlaywrightTestImports = getSourceFiles( sourceRoot ).filter( ( file ) =>
			forbiddenPlaywrightTestImport.test( fs.readFileSync( file, 'utf8' ) )
		);

		expect( filesWithPlaywrightTestImports ).toEqual( [] );
	} );
} );
