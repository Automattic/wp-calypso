#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const PACKAGE_JSON_PATH = path.join( ROOT_DIR, 'package.json' );
const DOCKERFILE_PATH = path.join( ROOT_DIR, 'Dockerfile' );

const EXPECTED_WORKSPACES = [ 'client', 'desktop', 'apps/*', 'packages/*', 'test/e2e' ];
const BLOCK_BEGIN = '# BEGIN: workspace package manifests (must stay in sync with package.json workspaces)';
const BLOCK_END = '# END: workspace package manifests';
const EXPECTED_COPY_LINES = [
	'COPY --parents \\',
	'  ./apps/*/package.json \\',
	'  ./packages/*/package.json \\',
	'  ./client/package.json \\',
	'  ./desktop/package.json \\',
	'  ./test/e2e/package.json \\',
	'  /calypso/',
];

function fail( message ) {
	console.error( message );
	process.exit( 1 );
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

function toSortedList( values ) {
	return [ ...values ].sort();
}

function hasExpectedWorkspaces( workspacePatterns ) {
	const actual = toSortedList( workspacePatterns );
	const expected = toSortedList( EXPECTED_WORKSPACES );

	return (
		actual.length === expected.length &&
		actual.every( ( value, index ) => value === expected[ index ] )
	);
}

function getManagedBlockLines( dockerfileContent ) {
	const lines = dockerfileContent.split( /\r?\n/ );
	const beginIndex = lines.findIndex( ( line ) => line.trim() === BLOCK_BEGIN );
	const endIndex = lines.findIndex( ( line ) => line.trim() === BLOCK_END );

	if ( beginIndex === -1 || endIndex === -1 || endIndex <= beginIndex ) {
		fail(
			`Could not find the Docker workspace manifest block in Dockerfile. Expected markers:\n${ BLOCK_BEGIN }\n${ BLOCK_END }`
		);
	}

	return lines.slice( beginIndex + 1, endIndex );
}

const packageJson = readJson( PACKAGE_JSON_PATH );
const workspacePatterns = getWorkspacePatterns( packageJson );

if ( ! hasExpectedWorkspaces( workspacePatterns ) ) {
	fail(
		`Docker workspace manifest COPY globs assume root workspaces are exactly:\n${ EXPECTED_WORKSPACES.join( '\n' ) }\n\nFound:\n${ workspacePatterns.join( '\n' ) }\n\nIf the workspace layout changed on purpose, please update the Dockerfile COPY block and this check script to match.`
	);
}

const dockerfileContent = fs.readFileSync( DOCKERFILE_PATH, 'utf8' );
const managedBlockLines = getManagedBlockLines( dockerfileContent );
const isDockerfileBlockValid =
	managedBlockLines.length === EXPECTED_COPY_LINES.length &&
	managedBlockLines.every( ( line, index ) => line === EXPECTED_COPY_LINES[ index ] );

if ( ! isDockerfileBlockValid ) {
	fail(
		`Dockerfile workspace manifest COPY block does not match the expected convention.\n\nExpected:\n${ EXPECTED_COPY_LINES.join( '\n' ) }\n\nIf this is intentional, update the COPY block in the Dockerfile to match the new layout.`
	);
}

console.log( 'All good: Docker workspace COPY globs match the workspace convention.' );
