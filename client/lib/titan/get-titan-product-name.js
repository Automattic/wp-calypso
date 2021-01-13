/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';
import i18n from 'i18n-calypso';

export function getTitanProductName() {
	if ( isEnabled( 'titan/phase-2' ) ) {
		return i18n.translate( 'Email' );
	}
	return i18n.translate( 'Titan Mail' );
}
