/**
 * External dependencies
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import childProcess from 'child_process';
import { promisify } from 'util';

const exec = promisify( childProcess.exec );

/**
 * Internal dependencies
 */
import { findDependencies } from './lib/find-dependencies.js';

const packageMapPath = path.join(
	path.dirname( fileURLToPath( import.meta.url ) ),
	'../../../../package-map.json'
);

type PackageMapEntry = {
	path: string;
	additionalEntryPoints: Array< string > | undefined;
};
type PackageMap = Array< PackageMapEntry >;
const packageMap: PackageMap = JSON.parse( fs.readFileSync( packageMapPath, 'utf8' ) );

function getMonorepoPackages() {
	const packages = fs.readdirSync( 'packages', { withFileTypes: true } );
	return packages
		.filter( ( entry ) => entry.isDirectory() )
		.map( ( entry ) => path.resolve( 'packages', entry.name ) );
}
const monorepoPackages = getMonorepoPackages();

const findPackageDependencies = async ( {
	path: pkgPath,
	additionalEntryPoints,
}: PackageMapEntry ) => {
	const absolutePkgPath = path.resolve( pkgPath );

	const { missing, packages, modules } = await findDependencies( {
		pkg: absolutePkgPath,
		additionalEntryPoints,
		monorepoPackages,
	} );
	const { stdout } = await exec(
		`find ${ absolutePkgPath } -type f -not \\( -path '*/node_modules/*' -o -path '*/.cache/*' -o -path '*/dist/*' \\)`
	);
	const allFiles = stdout.trim().split( '\n' );

	// Files which exist in the filesystem, but the dep finder did not parse.
	// We exclude files which do not impact builds, such as ".txt" or ".md" files.
	const unknownFiles = allFiles.filter(
		( file ) => ! modules.includes( file ) && ! [ '.md', '.txt' ].includes( path.extname( file ) )
	);

	console.log( 'Package:' );
	console.log( '  ' + pkgPath );
	console.log( 'Missing files:' );
	console.log( missing.length ? missing.map( ( m ) => '  ' + m ).join( '\n' ) : '  -' );
	console.log( 'Packages:' );
	console.log( packages.length ? packages.map( ( m ) => '  ' + m ).join( '\n' ) : '  -' );
	console.log( 'Found files:' );
	console.log( modules.length ? modules.map( ( m ) => '  ' + m ).join( '\n' ) : '  -' );
	console.log( 'Unkown files:' );
	console.log( unknownFiles.length ? unknownFiles.map( ( m ) => '  ' + m ).join( '\n' ) : '  -' );
	console.log();
	console.log();
};

const main = async () => {
	const packageToParse = process.argv.slice( 2 )[ 0 ];
	// Allow parsing a single package.
	if ( packageToParse ) {
		const packageEntry = packageMap.find( ( { path } ) => path === packageToParse );
		if ( packageEntry ) {
			findPackageDependencies( packageEntry );
		}
	} else {
		for ( const packageEntry of packageMap ) {
			await findPackageDependencies( packageEntry );
		}
	}
};

main().catch( console.error );
