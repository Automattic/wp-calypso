/**
 * External dependencies
 */
import { readPackageAsync } from 'read-pkg';
import path from 'path';
import fs from 'fs';

export const findPackageJsonEntrypoints = async ( {
	pkgPath,
}: {
	pkgPath: string;
} ): Promise< string[] > => {
	const pkgJson = await readPackageAsync( { cwd: pkgPath } );

	const main = pkgJson[ 'calypso:src' ] ?? pkgJson.main ?? 'index.js';
	const bin = pkgJson.bin ?? {};

	const files = [ main, ...Object.values( bin ) ]
		.filter( Boolean )
		.map( ( file ) => path.resolve( pkgPath, file ) )
		.filter( ( file ) => {
			try {
				fs.accessSync( file );
				return true;
			} catch {
				return false;
			}
		} );
	return files;
};
