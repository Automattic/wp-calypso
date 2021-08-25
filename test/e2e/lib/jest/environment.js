const JestEnvironmentNode = require( 'jest-environment-node' );

class JestEnvironmentE2E extends JestEnvironmentNode {
	testFailed = false;
	hookFailed = false;

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
