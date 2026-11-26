#!/usr/bin/env node
import { basename, dirname, resolve } from 'node:path';
import util from 'node:util';
import glob from 'glob';
import { APPS_EXCLUDED_FROM_TYPE_CHECK } from './apps-excluded-from-type-check.mjs';
import runTask from './teamcity-task-runner.mjs';

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

// TeamCity reads Vitest results from a JUnit report, which `runVitestTask()` imports after the task.
function withVitestInfo( cmd, testId ) {
	const report = `test_results/${ testId }.xml`;
	return {
		testId,
		name: 'yarn',
		// Vitest resolves the report path from its config's `root`.
		args: `${ cmd } --reporter=default --reporter=junit --outputFile.junit=${ resolve( report ) }`,
		env: { CI: 'true' },
		report,
	};
}

async function runVitestTask( task ) {
	try {
		await runTask( task );
	} finally {
		console.log( `##teamcity[importData type='junit' path='${ task.report }']` );
	}
}

// The agenttic playground deliberately stays out of the shared type check: it
// type-checks the agenttic package sources, which carry pre-existing errors
// from their source repo (cleanup tracked as a migration follow-up).
const PACKAGES_EXCLUDED_FROM_TYPE_CHECK = [ 'agenttic-demo' ];

const [ packagesTsconfigs, appsTsconfigs ] = await Promise.all(
	[ 'packages', 'apps' ].map( ( path ) => globPromise( `${ path }/*/tsconfig.json` ) )
);

const isTypeCheckedApp = ( path ) =>
	! APPS_EXCLUDED_FROM_TYPE_CHECK.includes( basename( dirname( path ) ) );

const isTypeCheckedPackage = ( path ) =>
	! PACKAGES_EXCLUDED_FROM_TYPE_CHECK.includes( basename( dirname( path ) ) );

const tscPackages = withTscInfo( {
	cmd: `tsc --build ${ packagesTsconfigs.filter( isTypeCheckedPackage ).join( ' ' ) }`,
	id: 'type_check_packages',
} );

// Local checkouts only build the packages that packages/tsconfig.json references,
// while the task above builds every package, so CI would not notice a missing one.
const checkPackagesReferences = {
	name: 'node',
	args: 'bin/check-packages-tsconfig-references.mjs',
	testId: 'check_packages_tsconfig_references',
};

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
const testServer = withVitestInfo( 'test-server --maxWorkers=4', 'test_server' );
const testBuildTools = withVitestInfo( 'test-build-tools --maxWorkers=4', 'test_build_tools' );
// Includes ETK and Odyssey Stats, migrated here from their individual builds.
const testApps = withVitestInfo( 'test-apps --maxWorkers=4', 'test_apps' );

const testPackagesVitest = withVitestInfo( 'test-packages --maxWorkers=4', 'test_packages_vitest' );
const testDashboard = withVitestInfo( 'test-dashboard --maxWorkers=4', 'test_dashboard' );
const testClient = withVitestInfo( 'test-client --maxWorkers=8', 'test_client' );

// Checks for drift between the webpack and Vite configurations while both bundlers live in the repo:
// fails when the Vite dev server can no longer serve the Dashboard, which webpack builds don't notice.
const viteCheck = {
	name: 'yarn',
	args: 'vite-check',
	testId: 'vite_check',
};

const testWorkspaces = {
	name: 'yarn',
	args: 'workspaces foreach -A -vv --parallel run storybook:start --ci --smoke-test',
	testId: 'check_storybook',
};

try {
	// Since this task is so much larger than the others, we give it a large amount
	// of CPU and run it by itself. We let other tasks complete in parallel with
	// less CPU since they'll still finish much more quickly.
	const testClientTask = runVitestTask( testClient );

	// Runs alongside the client tests, which take longer than the rest, so it stays off the critical path.
	const testDashboardTask = runVitestTask( testDashboard );

	// The async () wrapper is needed so that the Promise settles only after
	// all tasks finish. If we instead use Promise.all with a chain of Promises,
	// Promise.all would complete when the first Promise in the chain settles.
	//
	// One note about the tsc tasks is that tsc doesn't parallelize well. This means
	// it doesn't expand to take advantage of more cores. As a result, it's the
	// limiting factor for overall build speed. We need to give it just enough cores
	// so that it runs as fast as possible, but leave enough to other tasks so that
	// they can finish by the time tsc finishes. I found that using 12 cores for
	// the tests and the remaining for tsc and anything else accomplished this.
	const tscTasks = ( async () => {
		// This task is a prerequisite for the other tsc tasks, so it must run separately.
		await runTask( checkPackagesReferences );
		await runTask( tscPackages );
		await completeTasks( tscCommands.map( runTask ) );
	} )();

	// Run these smaller tasks in serial to keep a healthy amount of CPU available for the other tasks.
	const otherTestTasks = ( async () => {
		await runVitestTask( testServer );
		await runVitestTask( testBuildTools );
		await runTask( viteCheck );
		await runVitestTask( testPackagesVitest );
		await runTask( testWorkspaces );
		await runVitestTask( testApps );
	} )();

	await completeTasks( [ testClientTask, testDashboardTask, tscTasks, otherTestTasks ] );
} catch ( exitCode ) {
	console.error( 'One or more tasks failed.' );
	process.exit( exitCode );
}
