const JestEnvironmentNode = require( 'jest-environment-node' );

class FailFast extends JestEnvironmentNode {
	testFailed = false;

	async handleTestEvent( event ) {
		if ( event.name === 'hook_failure' || event.name === 'test_fn_failure' ) {
			// If a hook or a test fails, enter in "failed mode"
			this.testFailed = true;
		} else if ( this.testFailed && event.name === 'test_start' ) {
			// If a test start when in failed mode, skip it
			event.test.mode = 'skip';
		}
	}
}

module.exports = FailFast;
