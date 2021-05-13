import { isEnabled } from '@automattic/calypso-config';

function fn() {
	// Should be replaced with true
	if ( isEnabled( 'foo' ) ) {
	}
}
