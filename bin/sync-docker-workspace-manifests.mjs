#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const PACKAGE_JSON_PATH = path.join( ROOT_DIR, 'package.json' );
const STAGING_DIR_NAME = '.docker-workspace-manifests';
const STAGING_DIR_PATH = path.join( ROOT_DIR, STAGING_DIR_NAME );
const NORMALIZED_TIME = new Date( '2000-01-01T00:00:00.000Z' );

const args = new Set( process.argv.slice( 2 ) );
const isCheckMode = args.has( '--check' );

if ( args.has( '--help' ) ) {
	console.log(
		'Usage: node bin/sync-docker-workspace-manifests.mjs [--check]\n' +
			`Creates ${ STAGING_DIR_NAME } with workspace package.json files mirrored by path.`
	);
	process.exit( 0 );
}

function fail( message ) {
	console.error( message );
	process.exit( 1 );
}

function escapeRegex( value ) {
	return value.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}

function segmentToRegex( segment ) {
	const pattern = '^' + segment.split( '*' ).map( escapeRegex ).join( '.*' ) + '$';
	return new RegExp( pattern );
}

function readJson( filePath ) {
	try {
		return JSON.parse( fs.readFileSync( filePath, 'utf8' ) );
	} catch ( error ) {
		fail( `Failed to read JSON file ${ filePath }: ${ error.message }` );
	}
}

function getWorkspacePatterns( packageJson ) {
	if ( Array.isArray( packageJson.workspaces ) ) {
		return packageJson.workspaces;
	}

	if ( Array.isArray( packageJson.workspaces?.packages ) ) {
		return packageJson.workspaces.packages;
	}

	fail( 'Could not find workspaces.packages in package.json.' );
}

function normalizePattern( pattern ) {
	return pattern
		.replaceAll( '\\', '/' )
		.replace( /^\.\/+/, '' )
		.replace( /\/+$/, '' );
}

function getSubdirectories( parentDir ) {
	try {
		return fs
			.readdirSync( parentDir, { withFileTypes: true } )
			.filter( ( entry ) => entry.isDirectory() )
			.map( ( entry ) => entry.name );
	} catch {
		return [];
	}
}

function expandPatternToDirs( pattern ) {
	const normalizedPattern = normalizePattern( pattern );
	const segments = normalizedPattern.split( '/' ).filter( Boolean );
	let dirs = [ ROOT_DIR ];

	for ( const segment of segments ) {
		const nextDirs = [];

		for ( const dir of dirs ) {
			if ( segment.includes( '*' ) ) {
				const regex = segmentToRegex( segment );
				for ( const child of getSubdirectories( dir ) ) {
					if ( regex.test( child ) ) {
						nextDirs.push( path.join( dir, child ) );
					}
				}
				continue;
			}

			const childDir = path.join( dir, segment );
			try {
				if ( fs.statSync( childDir ).isDirectory() ) {
					nextDirs.push( childDir );
				}
			} catch {
				// Ignore missing directories here; a helpful error is emitted if nothing matches below.
			}
		}

		dirs = nextDirs;
	}

	if ( dirs.length === 0 ) {
		fail( `Workspace pattern "${ pattern }" matched no directories.` );
	}

	return dirs.map( ( dir ) => path.relative( ROOT_DIR, dir ).replaceAll( '\\', '/' ) );
}

function getWorkspaceManifestPaths( workspacePatterns ) {
	const manifestPaths = new Set();

	for ( const pattern of workspacePatterns ) {
		const dirs = expandPatternToDirs( pattern );
		const isWildcardPattern = pattern.includes( '*' );
		let manifestsFoundForPattern = 0;

		for ( const dir of dirs ) {
			const manifestPath = `${ dir }/package.json`;
			const absoluteManifestPath = path.join( ROOT_DIR, manifestPath );

			if ( ! fs.existsSync( absoluteManifestPath ) ) {
				if ( isWildcardPattern ) {
					continue;
				}

				fail( `Expected workspace manifest does not exist: ${ manifestPath }` );
			}

			manifestsFoundForPattern += 1;
			manifestPaths.add( manifestPath );
		}

		if ( manifestsFoundForPattern === 0 ) {
			fail( `Workspace pattern "${ pattern }" did not resolve to any package.json files.` );
		}
	}

	return [ ...manifestPaths ].sort();
}

function listFilesRecursive( rootPath ) {
	if ( ! fs.existsSync( rootPath ) ) {
		return [];
	}

	const entries = [];

	function walk( currentPath, relativePrefix ) {
		for ( const entry of fs.readdirSync( currentPath, { withFileTypes: true } ) ) {
			const relativePath = relativePrefix ? `${ relativePrefix }/${ entry.name }` : entry.name;
			const absolutePath = path.join( currentPath, entry.name );

			if ( entry.isDirectory() ) {
				walk( absolutePath, relativePath );
			} else {
				entries.push( relativePath.replaceAll( '\\', '/' ) );
			}
		}
	}

	walk( rootPath, '' );
	return entries.sort();
}

function listDirectoriesRecursive( rootPath ) {
	if ( ! fs.existsSync( rootPath ) ) {
		return [];
	}

	const directories = [];

	function walk( currentPath ) {
		directories.push( currentPath );

		for ( const entry of fs.readdirSync( currentPath, { withFileTypes: true } ) ) {
			if ( entry.isDirectory() ) {
				walk( path.join( currentPath, entry.name ) );
			}
		}
	}

	walk( rootPath );

	// Write deeper directories first so parent mtimes stay normalized too.
	return directories.sort(
		( left, right ) =>
			right.split( path.sep ).length - left.split( path.sep ).length || right.length - left.length
	);
}

function arraysMatch( left, right ) {
	return left.length === right.length && left.every( ( value, index ) => value === right[ index ] );
}

function checkStagingDirectory( manifestPaths ) {
	if ( ! fs.existsSync( STAGING_DIR_PATH ) ) {
		fail(
			`Docker workspace manifest staging directory is missing (${ STAGING_DIR_NAME }). Run: yarn run sync:docker-workspace-manifests`
		);
	}

	const stagedFiles = listFilesRecursive( STAGING_DIR_PATH );

	if ( ! arraysMatch( stagedFiles, manifestPaths ) ) {
		fail(
			`Docker workspace manifest staging directory is out of date. Run: yarn run sync:docker-workspace-manifests`
		);
	}

	for ( const manifestPath of manifestPaths ) {
		const sourcePath = path.join( ROOT_DIR, manifestPath );
		const stagedPath = path.join( STAGING_DIR_PATH, manifestPath );

		const sourceBuffer = fs.readFileSync( sourcePath );
		const stagedBuffer = fs.readFileSync( stagedPath );

		if ( ! sourceBuffer.equals( stagedBuffer ) ) {
			fail(
				`Docker workspace manifest staging directory is out of date. File mismatch at: ${ manifestPath }. Run: yarn run sync:docker-workspace-manifests`
			);
		}
	}

	console.log( 'Docker workspace manifest staging directory is up to date.' );
}

function writeStagingDirectory( manifestPaths ) {
	fs.rmSync( STAGING_DIR_PATH, { recursive: true, force: true } );
	fs.mkdirSync( STAGING_DIR_PATH, { recursive: true } );

	for ( const manifestPath of manifestPaths ) {
		const sourcePath = path.join( ROOT_DIR, manifestPath );
		const stagedPath = path.join( STAGING_DIR_PATH, manifestPath );

		fs.mkdirSync( path.dirname( stagedPath ), { recursive: true } );
		fs.copyFileSync( sourcePath, stagedPath );
		fs.utimesSync( stagedPath, NORMALIZED_TIME, NORMALIZED_TIME );
	}

	for ( const stagedDir of listDirectoriesRecursive( STAGING_DIR_PATH ) ) {
		fs.utimesSync( stagedDir, NORMALIZED_TIME, NORMALIZED_TIME );
	}

	console.log(
		`Updated Docker workspace manifest staging directory with ${ manifestPaths.length } entries.`
	);
}

const packageJson = readJson( PACKAGE_JSON_PATH );
const workspacePatterns = getWorkspacePatterns( packageJson );
const manifestPaths = getWorkspaceManifestPaths( workspacePatterns );

if ( isCheckMode ) {
	checkStagingDirectory( manifestPaths );
} else {
	writeStagingDirectory( manifestPaths );
}
