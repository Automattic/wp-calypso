#!/usr/bin/env node
import util from 'util';
import glob from 'glob';
import runTask from './teamcity-task-runner.mjs';

const globPromise = util.promisify( glob );

function withTscInfo( { cmd, id } ) {
	return {
		testId: id,
		name: 'yarn',
		args: cmd,
		env: { NODE_ENV: 'test' },
	};
}

function withUnitTestInfo( cmd ) {
	return {
		testId: cmd.split( ' ' )[ 0 ],
		name: 'yarn',
		args: `${ cmd } --ci --reporters=default --reporters=jest-teamcity --silent`,
	};
}

const allPackageTsconfigs = ( await globPromise( 'packages/*/tsconfig.json' ) ).join( ' ' );
const tscPackages = withTscInfo( {
	cmd: `tsc --build ${ allPackageTsconfigs }`,
	id: 'type_check_packages',
} );

const tscCommands = [
	{ cmd: 'tsc --noEmit --project apps/editing-toolkit/tsconfig.json', id: 'type_check_etk' },
	{ cmd: 'tsc --noEmit --project client/tsconfig.json', id: 'type_check_client' },
	{ cmd: 'tsc --noEmit --project test/e2e/tsconfig.json', id: 'type_check_tests' },
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
const testClient = withUnitTestInfo( 'test-client --maxWorkers=8' );
const testPackages = withUnitTestInfo( 'test-packages --maxWorkers=4' );
const testServer = withUnitTestInfo( 'test-server --maxWorkers=4' );
const testBuildTools = withUnitTestInfo( 'test-build-tools --maxWorkers=4' );

const testWorkspaces = {
	name: 'yarn',
	args: 'workspaces foreach --verbose --parallel run storybook --ci --smoke-test',
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
		await Promise.allSettled( tscCommands.map( runTask ) );
	} )();

	// Run these smaller tasks in serial to keep a healthy amount of CPU available for the other tasks.
	const otherTestTasks = ( async () => {
		await runTask( testPackages );
		await runTask( testServer );
		await runTask( testBuildTools );
		await runTask( testWorkspaces );
	} )();

	await Promise.allSettled( [ testClientTask, tscTasks, otherTestTasks ] );
} catch ( exitCode ) {
	console.log( `A task failed with exit code ${ exitCode }` );
	process.exit( exitCode );
}
