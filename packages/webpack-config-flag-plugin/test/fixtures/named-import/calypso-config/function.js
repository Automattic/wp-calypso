import { isEnabled } from 'calypso/config';

function fn() {
	// Should be replaced with true
	if ( isEnabled( 'foo' ) ) {
	}
}
