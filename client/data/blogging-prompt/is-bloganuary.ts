import { isEnabled } from '@automattic/calypso-config';
import moment from 'moment';
/**
 * @returns true if bloganuary mode is active
 */
export default function isBloganuary() {
	// Disable for January 2025 (see https://wp.me/p5uIfZ-gxX).
	const BLOGANUARY_ENABLED = false;
	if ( ! BLOGANUARY_ENABLED ) {
		return false;
	}
	return moment().format( 'MM' ) === '01' || isEnabled( 'bloganuary' );
}
