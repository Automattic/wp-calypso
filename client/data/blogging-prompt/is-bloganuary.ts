import { isEnabled } from '@automattic/calypso-config';
import moment from 'moment';
/**
 * @returns true if bloganuary mode is active
 */
export default function isBloganuary() {
	// Disable for January 2025 and beyond (see https://wp.me/p5uIfZ-gxX).
	// Intentionally redundant to make it easier to spot the disable condition,
	// and avoid removing code we may re-enable in the future.
	const BLOGANUARY_ENABLED = false;
	if ( ! BLOGANUARY_ENABLED ) {
		return false;
	}
	return moment().format( 'MM' ) === '01' || isEnabled( 'bloganuary' );
}
