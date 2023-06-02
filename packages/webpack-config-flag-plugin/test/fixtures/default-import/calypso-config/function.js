import config from '@automattic/calypso-config';

function fn() {
	// Should be replaced with true
	if ( config.isEnabled( 'foo' ) ) {
	}
}
