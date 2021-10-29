import fs from 'fs/promises';
import path from 'path';
const JestEnvironmentNode = require( 'jest-environment-node' );

class JestEnvironmentE2E extends JestEnvironmentNode {
	testFailed = false;
	describeFailed = false;
	hookFailed = false;

	constructor( config, context ) {
		super( config, context );
		this.fileName = path.parse( context.testPath ).name;
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
		// Generate a unique name by appending a random string after the file name.
		const artifactPath = await fs.mkdtemp( path.join( resultsPath, this.fileName + '-' ) );
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
				this.global.__FAILED_STEP_NAME__ = null;
				this.global.__STEP_FAILED__ = false;
				this.global.__FILE_NAME__ = this.fileName;

			case 'test_start':
				// If a test has failed, skip rest of the steps.
				if ( this.testFailed ) {
					event.test.mode = 'skip';
				}

				/* If a hook has failed, mark all subsequent test
				steps as failed.
				Handling is different compared to test steps because
				Jest treats failed hooks differently from tests.
				*/
				if ( this.hookFailed ) {
					event.test.mode = 'fail';
				}
				break;

			case 'hook_failure':
				this.global.__FAILED_STEP_NAME__ = event.hook.type;
				this.global.__STEP_FAILED__ = true;
				this.hookFailed = true;
				break;

			case 'test_fn_failure':
				this.global.__FAILED_STEP_NAME__ = event.test.name;
				this.global.__STEP_FAILED__ = true;
				this.testFailed = true;
				break;
		}
	}
}

module.exports = JestEnvironmentE2E;
