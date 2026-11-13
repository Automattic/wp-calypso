import { BLACK_FRIDAY_2026_COUPON, isBlackFriday2026Active } from './black-friday-2026';

/**
 * Returns the coupon to price the plans grid with: an explicit coupon always wins,
 * otherwise the Black Friday 2026 coupon while the sale is on.
 */
export function getCouponWithBlackFriday2026Default(
	coupon?: string | null,
	now: number = Date.now()
): string | undefined {
	if ( coupon ) {
		return coupon;
	}
	return isBlackFriday2026Active( now ) ? BLACK_FRIDAY_2026_COUPON : undefined;
}
