import * as config from 'config';

// Should NOT be replaced with true
function fn() {
	const config = { isEnabled: () => false };
	if ( config.isEnabled( 'foo' ) ) {
	}
}
