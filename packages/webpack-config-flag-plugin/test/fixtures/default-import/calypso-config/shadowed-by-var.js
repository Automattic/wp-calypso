import config from '@automattic/calypso-config';

function fn() {
	const config = { isEnabled: () => false };
	// Should NOT be replaced with true
	if ( config.isEnabled( 'foo' ) ) {
	}
}
