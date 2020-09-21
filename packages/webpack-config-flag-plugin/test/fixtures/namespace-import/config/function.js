import * as config from 'config';

function fn() {
	// Should be replaced with true
	if ( config.isEnabled( 'foo' ) ) {
	}
}
