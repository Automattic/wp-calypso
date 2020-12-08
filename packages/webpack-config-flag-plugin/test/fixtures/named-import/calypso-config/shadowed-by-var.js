import { isEnabled } from 'calypso/config';

function fn() {
	const isEnabled = () => false;
	// Should NOT be replaced with true
	if ( isEnabled( 'foo' ) ) {
	}
}
