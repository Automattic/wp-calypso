import config from '@automattic/calypso-config';

/**
 * Black Friday 2026 sale window and placeholder copy.
 * Copy and the coupon are placeholders until Marketing finalizes them.
 */
export const BLACK_FRIDAY_2026_START = Date.UTC( 2026, 10, 27, 0, 0, 0 );
export const BLACK_FRIDAY_2026_END = Date.UTC( 2026, 11, 2, 0, 0, 0 );
export const BLACK_FRIDAY_2026_COUPON = 'BFWPCOM2026';
export const BLACK_FRIDAY_2026_DISCOUNT_PERCENT = 25;
export const BLACK_FRIDAY_2026_LANDING_URL = 'https://wordpress.com/black-friday-2026/';

/**
 * True when the feature flag is on and the sale is running.
 * Development skips the date check so the sale can be tested before it starts.
 */
export function isBlackFriday2026Active( now: number = Date.now() ): boolean {
	if ( ! config.isEnabled( 'black-friday-2026' ) ) {
		return false;
	}
	if ( 'development' === config( 'env' ) ) {
		return true;
	}
	return now >= BLACK_FRIDAY_2026_START && now < BLACK_FRIDAY_2026_END;
}
