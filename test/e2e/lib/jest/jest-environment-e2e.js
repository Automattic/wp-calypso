const JestEnvironmentNode = require( 'jest-environment-node' );

class JestEnvironmentE2E extends JestEnvironmentNode {
	testFailed = false;

	async handleTestEvent( event ) {
		// Top describe (event.describeBlock.name)
		// 		event.type=="run_describe_start" && event.describeBlock.parent.name === "ROOT_DESCRIBE_BLOCK"

		// Test (event.test.name)
		//

		// Save reference to current test
		if ( event.name === 'test_start' ) {
			this.global.__CURRENT_TEST_NAME__ = event.test.name;
			return;
		}

		// If a hook or a test fails, enter in "failed mode"
		if ( event.name === 'hook_failure' || event.name === 'test_fn_failure' ) {
			this.global.__CURRENT_TEST_FAILED__ = true;
			this.testFailed = true;
			return;
		}

		// If a test starts after a test has already failed, skip it
		if ( this.testFailed && event.name === 'test_start' ) {
			event.test.mode = 'skip';
			return;
		}
	}
}

module.exports = JestEnvironmentE2E;
