import { spawn } from 'node:child_process';
import chalk from 'chalk';

// This is technically an import side-effect for the callee, but any TeamCity
// suite using it will need the behavior.
// It attempts to fix an issue where log messages are truncated on process.exit
// due to poor behavior in NodeJS (which is that io streams don't flush on exit)
// See https://github.com/nodejs/node/issues/6379
for ( const stream of [ process.stdout, process.stderr ] ) {
	stream?._handle?.setBlocking?.( true );
}

export default async function runTask( { name = 'yarn', args, env = {}, testId } ) {
	return new Promise( ( resolve, reject ) => {
		const startTime = Date.now();
		console.log( `Spawning task: ${ name } ${ args }` );
		const task = spawn( name, args.split( ' ' ), {
			shell: true,
			env: {
				...process.env,
				...env,
				// This is used by the jest-teamcity reporter to let us nest test results in the log output.
				TEAMCITY_FLOWID: testId,
			},
		} );

		let stdout = '';
		let stderr = '';
		task.stdout.on( 'data', ( data ) => {
			stdout += data;
		} );
		task.stderr.on( 'data', ( data ) => {
			stderr += data;
		} );

		task.on( 'close', ( exitCode ) => {
			const duration = Date.now() - startTime;

			const color = exitCode === 0 ? chalk.green : chalk.red;

			console.log(
				chalk.bold(
					color(
						`Task ${ testId } ${ exitCode === 0 ? 'succeeded' : 'failed' } after ${ duration }ms.`
					)
				)
			);

			console.log( `##teamcity[blockOpened name='     Output for ${ testId }']` );

			// Avoid logging empty blocks when there's no output:
			// Essentially, any messages with a flowId will get nested inside the
			// test suite. This happens with the jest-teamcity reporter, making it
			// easy to nest Jest's test results. We put this inside a block without
			// a flowId so that messages without a flowId can still be contained
			// within the block. (Like stdout.)
			console.log(
				`##teamcity[testSuiteStarted name='     Tests for ${ testId }' flowId='${ testId }']`
			);
			if ( stdout.trim() ) {
				// TeamCity will take the service messages with a flowId (like from
				// the jest test reporter) and put them under the test suite block.
				// Non-service-message output will not be nested, but would be shown
				// below. If everything in stdout was a service message, it will
				// appear empty here. So we add a message to indicate that.
				console.log(
					chalk.italic( 'If no output is shown, look for it under the test section for this task.' )
				);
				console.log( '....STDOUT....' );
				console.log( stdout );
			}
			if ( stderr.trim() ) {
				console.log( '....STDERR....' );
				console.log( stderr );
			}
			console.log(
				`##teamcity[testSuiteFinished name='     Tests for ${ testId }' flowId='${ testId }']`
			);

			console.log( `##teamcity[blockClosed name='     Output for ${ testId }']` );

			if ( exitCode === 0 ) {
				resolve();
			} else {
				reject( exitCode );
			}
		} );
		task.on( 'error', reject );
	} );
}
