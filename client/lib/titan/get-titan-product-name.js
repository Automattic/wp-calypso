/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';

export function getTitanProductName() {
	if ( isEnabled( 'titan/phase-2' ) ) {
		return i18n.translate( 'Email' );
	}
	return i18n.translate( 'Titan Mail' );
}
