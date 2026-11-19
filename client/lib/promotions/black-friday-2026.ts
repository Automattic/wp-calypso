import config from '@automattic/calypso-config';

/**
 * Black Friday 2026 sale window, coupon and landing page.
 */
export const BLACK_FRIDAY_2026_START = Date.UTC( 2026, 10, 27, 0, 0, 0 );
export const BLACK_FRIDAY_2026_END = Date.UTC( 2026, 11, 2, 0, 0, 0 );
export const BLACK_FRIDAY_2026_COUPON = 'BFWPCOM2026';
export const BLACK_FRIDAY_2026_DISCOUNT_PERCENT = 25;
export const BLACK_FRIDAY_2026_MONTHLY_SAVINGS_PERCENT = 66;
export const BLACK_FRIDAY_2026_LANDING_URL = 'https://wordpress.com/black-friday-2026/';

/**
 * True while the sale is running. The `black-friday-2026` flag shows the sale
 * outside those dates, for review.
 */
export function isBlackFriday2026Active( now: number = Date.now() ): boolean {
	if ( config.isEnabled( 'black-friday-2026' ) ) {
		return true;
	}
	return now >= BLACK_FRIDAY_2026_START && now < BLACK_FRIDAY_2026_END;
}
