import * as config from 'calypso/config';

function fn() {
	// Should be replaced with true
	if ( config.isEnabled( 'foo' ) ) {
	}
}
