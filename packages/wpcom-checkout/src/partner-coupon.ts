/**
 * Get Partner Coupon
 *
 * This method uses some of the same detection logic as partnerCouponRedirects in
 * the Connection controller, and future improvements should probably unify the two
 * code bases to "generic utility functions".
 */
export function getPartnerCoupon( { coupon }: { coupon: string } ): boolean {
	return coupon.startsWith( 'IONOS_' );
}
