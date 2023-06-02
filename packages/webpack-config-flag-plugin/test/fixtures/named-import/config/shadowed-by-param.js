import { isEnabled } from 'config';

function fn( isEnabled ) {
	// Should NOT be replaced with true
	if ( isEnabled( 'foo' ) ) {
	}
}
