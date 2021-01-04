/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';

export function getDefaultDateFormats() {
	return [
		translate( 'F j, Y' ),
		translate( 'Y-m-d' ),
		translate( 'm/d/Y' ),
		translate( 'd/m/Y' ),
	];
}

export function getDefaultTimeFormats() {
	return [ translate( 'g:i a' ), translate( 'g:i A' ), translate( 'H:i' ) ];
}
