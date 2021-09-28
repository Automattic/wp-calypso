import fs from 'fs/promises';
import path from 'path';
const JestEnvironmentNode = require( 'jest-environment-node' );

class JestEnvironmentE2E extends JestEnvironmentNode {
	testFailed = false;
	describeFailed = false;
	hookFailed = false;

	constructor( config, context ) {
		super( config, context );
		this.testPath = context.testPath;
	}

	/**
	 * Set up the environment.
	 */
	async setup() {
		await super.setup();

		// Intermediate path storing all artifacts.
		const resultsPath = path.join( process.cwd(), 'results' );
		// Create the directory if necessary.
		await fs.mkdir( resultsPath, { recursive: true } );
		const testPath = path.basename( this.testPath, path.extname( this.testPath ) );
		// Create a unique artifact directory.
		const artifactPath = await fs.mkdtemp( path.join( resultsPath, testPath + '-' ) );
		this.global.artifactPath = artifactPath;
	}

	/**
	 * Custom handler for the test events emitted by jest-circus.
	 *
	 * @param {*} event Test event emitted.
	 */
	async handleTestEvent( event ) {
		switch ( event.name ) {
			case 'setup':
				this.global.__CURRENT_TEST_NAME__ = null;
				this.global.__CURRENT_TEST_FAILED__ = false;
				break;

			case 'test_start':
				this.global.__CURRENT_TEST_NAME__ = event.test.name;

				if ( this.testFailed ) {
					event.test.mode = 'skip';
				}
				// With this flag enabled, all test cases in the describe
				// block will be marked as failed.
				// This way all other hooks (screenshot/recording) are run,
				// and Jest correctly exits after those hooks are run.
				if ( this.hookFailed ) {
					event.test.mode = 'fail';
				}
				break;

			case 'hook_failure':
				this.global.__CURRENT_TEST_FAILED__ = true;
				this.hookFailed = true;
				break;

			case 'test_fn_failure':
				this.global.__CURRENT_TEST_FAILED__ = true;
				this.testFailed = true;
				break;
		}
	}
}

module.exports = JestEnvironmentE2E;
