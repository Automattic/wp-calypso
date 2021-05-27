/**
 * External dependencies
 */
import path from 'path';
import { readFile, readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import childProcess from 'child_process';
import { promisify } from 'util';
import yargs from 'yargs';

const args = yargs( process.argv.slice( 2 ) )
	.usage( 'Usage: $0' )
	.option( 'changedFiles', {
		describe: 'A path to the list of VCS changed files',
		type: 'string',
	} )
	.option( 'package', {
		describe: 'The package to process from package-map.json',
		type: 'string',
	} ).argv;

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
	buildIds: Array< string > | undefined;
};
type PackageMap = Array< PackageMapEntry >;

// TODO: import from build-tools
async function getMonorepoPackages() {
	const packages = await readdir( 'packages', { withFileTypes: true } );
	return packages
		.filter( ( entry ) => entry.isDirectory() )
		.map( ( entry ) => path.resolve( 'packages', entry.name ) );
}

type Project = {
	matchingFiles: Array< string >;
	buildIds: Array< string > | undefined;
};

const findPackageDependencies = async ( entry: PackageMapEntry ): Promise< Project > => {
	const { path: pkgPath, additionalEntryPoints } = entry;
	const absolutePkgPath = path.resolve( pkgPath );

	const { missing, packages, modules } = await findDependencies( {
		pkg: absolutePkgPath,
		additionalEntryPoints,
		monorepoPackages: await getMonorepoPackages(),
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
	return {
		...entry,
		matchingFiles: modules,
	};
};

/**
 * Given a list of currently modified files, returns the CI jobs which need to be
 * launched.
 *
 * TODO: improve algorithmic complexity. Currently O(modifiedFiles * projects * matchingFiles).
 *
 * @param projects The list of projects.
 * @param modifiedFiles The list of currently modified files.
 * @returns A Set of CI Job IDs to launch.
 */
// TODO: make sure project files are relative to repo root. Currently, modifiedFiles
// are relative to the repo root, but project files are absolute.
function findMatchingBuilds( projects: Project[], modifiedFiles: VCSFileChange[] ) {
	return modifiedFiles.reduce< Set< string > >( ( acc, modifiedFile ) => {
		const matchingProject = projects.find( ( proj ) =>
			proj.matchingFiles.some( ( file ) => file.includes( modifiedFile.path ) )
		);
		if ( matchingProject?.buildIds ) {
			matchingProject.buildIds.forEach( ( id ) => acc.add( id ) );
		}
		return acc;
	}, new Set() );
}

// <relative file path>:<change type>:<revision>
// see https://plugins.jetbrains.com/docs/teamcity/risk-tests-reordering-in-custom-test-runner.html
type VCSFileChange = {
	path: string;
	changeType:
		| 'CHANGED'
		| 'ADDED'
		| 'REMOVED'
		| 'NOT_CHANGED'
		| 'DIRECTORY_CHANGED'
		| 'DIRECTORY_ADDED'
		| 'DIRECTORY_REMOVED';
	revision: string;
};
async function readTeamCityMatchedFiles( filePath: string ) {
	const rawContents = await readFile( filePath, 'utf8' );
	return rawContents.split( '\n' ).reduce< VCSFileChange[] >( ( acc, entry ) => {
		const [ path, changeType, revision ] = entry.split( ':' );
		if ( path && changeType && revision ) {
			acc.push( { path, changeType, revision } as VCSFileChange );
		}
		return acc;
	}, [] );
}

const main = async () => {
	const packageMap: PackageMap = JSON.parse( await readFile( packageMapPath, 'utf8' ) );
	const changedFiles = args.changedFiles
		? await readTeamCityMatchedFiles( args.changedFiles )
		: null;

	if ( args.package ) {
		const packageEntry = packageMap.find( ( { path } ) => path === args.package );
		if ( packageEntry ) {
			const project = await findPackageDependencies( packageEntry );
			if ( changedFiles ) {
				const builds = await findMatchingBuilds( [ project ], changedFiles );
				builds.forEach( console.log );
			}
		}
	} else {
		for ( const packageEntry of packageMap ) {
			await findPackageDependencies( packageEntry );
		}
	}
};

main().catch( console.error );
