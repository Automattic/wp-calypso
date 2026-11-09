#!/usr/bin/env node
// With no arguments, runs every package's unit tests on Jest and then on Vitest. Arguments are
// Jest's and go to Jest alone; packages on Vitest are filtered with `yarn test-packages:vitest`.
import { spawnSync } from 'node:child_process';

const args = process.argv.slice( 2 );
const run = ( script, scriptArgs = [] ) =>
	spawnSync( 'yarn', [ 'run', script, ...scriptArgs ], { stdio: 'inherit' } ).status ?? 1;

const jest = run( 'test-packages:jest', args );
if ( args.length ) {
	console.log(
		'Arguments go to Jest only. For packages on Vitest, run: yarn test-packages:vitest [path]'
	);
	process.exit( jest );
}
process.exit( run( 'test-packages:vitest' ) || jest );
