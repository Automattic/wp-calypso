#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { basename, dirname } from 'node:path';
import util from 'node:util';
import glob from 'glob';
import runTask from './teamcity-task-runner.mjs';

// The ref the branch is compared against to determine which files changed. This
// mirrors the diff base used elsewhere in CI (see .teamcity WebApp build steps).
const PARENT_REF = 'refs/remotes/origin/trunk';

// List the files touched by this branch relative to the parent ref, excluding
// deletions (a deleted file has no tests left to relate to).
function getChangedFiles() {
	try {
		return execSync( `git diff --name-only --diff-filter=d ${ PARENT_REF }...HEAD`, {
			encoding: 'utf8',
		} )
			.split( '\n' )
			.map( ( file ) => file.trim() )
			.filter( Boolean );
	} catch ( error ) {
		console.warn( `Could not determine changed files, running the full suite: ${ error.message }` );
		return [];
	}
}

const changedFiles = getChangedFiles();

// TEMPORARY: These apps *should* be type-checked, but there are existing issues that need to be
// resolved.
const APPS_EXCLUDED_FROM_TYPE_CHECK = [
	'happy-blocks',
	'o2-blocks',
	'odyssey-stats',
	'notifications',
	'wpcom-block-editor',
];

const globPromise = util.promisify( glob );

// Promise.allSettled with some extra code to throw an error.
async function completeTasks( promises ) {
	const results = await Promise.allSettled( promises );
	const exitCodes = results
		.filter( ( { status } ) => status === 'rejected' )
		.map( ( { reason } ) => reason );
	if ( exitCodes.length ) {
		throw exitCodes[ 0 ];
	}
}

function withTscInfo( { cmd, id } ) {
	return {
		testId: id,
		name: 'yarn',
		args: cmd,
		env: { NODE_ENV: 'test' },
	};
}

function withUnitTestInfo( cmd ) {
	// Restrict each Jest run to the tests related to the files changed on this
	// branch. When nothing changed (or the diff couldn't be resolved), fall back
	// to the full suite since `--findRelatedTests` requires at least one path.
	// `--passWithNoTests` keeps a project green when none of the changed files
	// map to tests in that project (otherwise Jest exits 1 with "No tests found").
	const relatedTests = changedFiles.length
		? ` --passWithNoTests --findRelatedTests ${ changedFiles.join( ' ' ) }`
		: '';
	return {
		testId: cmd.split( ' ' )[ 0 ],
		name: 'yarn',
		args: `${ cmd } --ci --reporters=default --reporters=jest-teamcity --silent${ relatedTests }`,
	};
}

const [ packagesTsconfigs, appsTsconfigs ] = await Promise.all(
	[ 'packages', 'apps' ].map( ( path ) => globPromise( `${ path }/*/tsconfig.json` ) )
);

const isTypeCheckedApp = ( path ) =>
	! APPS_EXCLUDED_FROM_TYPE_CHECK.includes( basename( dirname( path ) ) );

const tscPackages = withTscInfo( {
	cmd: `tsc --build ${ packagesTsconfigs.join( ' ' ) }`,
	id: 'type_check_packages',
} );

const tscCommands = [
	{ cmd: 'tsc --noEmit --project build-tools/tsconfig.json', id: 'type_check_build_tools' },
	{ cmd: 'tsc --noEmit --project client/tsconfig.json', id: 'type_check_client' },
	{ cmd: 'tsc --noEmit --project test/e2e/tsconfig.json', id: 'type_check_tests' },
	...appsTsconfigs.filter( isTypeCheckedApp ).map( ( path ) => ( {
		cmd: `tsc --noEmit --project ${ path }`,
		id: `type_check_apps_${ basename( dirname( path ) ) }`,
	} ) ),
].map( withTscInfo );

// When Jest runs without --maxWorkers, each instance of Jest will try to use all
// cores available. (Which is a lot in our CI.) This isn't a problem per se, because
// everything ends up completing pretty quickly. However, with 100% CPU usage for
// most of the test, it's possible for some tests which rely on i/o to time out.
// This causes flakey tests. As a result, we need to manage the number of workers
// manually so that there is some amount of margin.
//
// After some testing, I've found that 8+4 is a good setup. The largest task
// runs by itself with 8 cores, and the other tasks run one by one with 4 other
// cores. This leaves a final 4 cores free for tsc + any other tasks. This seems
// to result in the fastest overall completion time.
//
// --workerIdleMemoryLimit=512MB is added because of https://github.com/jestjs/jest/issues/11956
const testClient = withUnitTestInfo( 'test-client --maxWorkers=8 --workerIdleMemoryLimit=1GB' );
const testPackages = withUnitTestInfo( 'test-packages --maxWorkers=4 --workerIdleMemoryLimit=1GB' );
const testServer = withUnitTestInfo( 'test-server --maxWorkers=4 --workerIdleMemoryLimit=1GB' );
const testBuildTools = withUnitTestInfo(
	'test-build-tools --maxWorkers=4 --workerIdleMemoryLimit=1GB'
);
// Includes ETK and Odyssey Stats, migrated here from their individual builds.
const testApps = withUnitTestInfo( 'test-apps --maxWorkers=1 --workerIdleMemoryLimit=1GB' );

const testWorkspaces = {
	name: 'yarn',
	args: 'workspaces foreach -A --verbose --parallel run storybook:start --ci --smoke-test',
	testId: 'check_storybook',
};

try {
	// Since this task is so much larger than the others, we give it a large amount
	// of CPU and run it by itself. We let other tasks complete in parallel with
	// less CPU since they'll still finish much more quickly.
	const testClientTask = runTask( testClient );

	// The async () wrapper is needed so that the Promise settles only after
	// all tasks finish. If we instead use Promise.all with a chain of Promises,
	// Promise.all would complete when the first Promise in the chain settles.
	//
	// One note about the tsc tasks is that tsc doesn't parallelize well. This means
	// it doesn't expand to take advantage of more cores. As a result, it's the
	// limiting factor for overall build speed. We need to give it just enough cores
	// so that it runs as fast as possible, but leave enough to other tasks so that
	// they can finish by the time tsc finishes. I found that using 12 cores for
	// jest and the remaining for tsc and anything else accomplished this.
	const tscTasks = ( async () => {
		// This task is a prerequisite for the other tsc tasks, so it must run separately.
		await runTask( tscPackages );
		await completeTasks( tscCommands.map( runTask ) );
	} )();

	// Run these smaller tasks in serial to keep a healthy amount of CPU available for the other tasks.
	const otherTestTasks = ( async () => {
		await runTask( testPackages );
		await runTask( testServer );
		await runTask( testBuildTools );
		await runTask( testWorkspaces );
		await runTask( testApps );
	} )();

	await completeTasks( [ testClientTask, tscTasks, otherTestTasks ] );
} catch ( exitCode ) {
	console.error( 'One or more tasks failed.' );
	process.exit( exitCode );
}
