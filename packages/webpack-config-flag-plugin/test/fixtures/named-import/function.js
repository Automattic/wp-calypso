import { isEnabled } from 'config';

function fn() {
	// Should be replaced with true
	if ( isEnabled( 'foo' ) ) {
	}
}
