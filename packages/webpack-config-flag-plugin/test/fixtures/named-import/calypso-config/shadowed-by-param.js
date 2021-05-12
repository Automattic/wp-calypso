import { isEnabled } from '@automattic/calypso-config';

function fn( isEnabled ) {
	// Should NOT be replaced with true
	if ( isEnabled( 'foo' ) ) {
	}
}
