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

/**
 * The lifecycle email experiment. Its treatment group gets the 30% offer in emails and in
 * the product, everyone else gets the public offer. Calypso only reads assignments, users
 * are assigned when the first email is sent.
 */
export const BLACK_FRIDAY_2026_LIFECYCLE_EXPERIMENT =
	'test_guides_wpcom_black_friday_sale_20261127';
export const BLACK_FRIDAY_2026_LIFECYCLE_COUPON = 'BF30WPCOM2026';
export const BLACK_FRIDAY_2026_LIFECYCLE_DISCOUNT_PERCENT = 30;

export interface BlackFriday2026Offer {
	coupon: string;
	percent: number;
	isLifecycle: boolean;
}

export const BLACK_FRIDAY_2026_PUBLIC_OFFER: BlackFriday2026Offer = {
	coupon: BLACK_FRIDAY_2026_COUPON,
	percent: BLACK_FRIDAY_2026_DISCOUNT_PERCENT,
	isLifecycle: false,
};

export const BLACK_FRIDAY_2026_LIFECYCLE_OFFER: BlackFriday2026Offer = {
	coupon: BLACK_FRIDAY_2026_LIFECYCLE_COUPON,
	percent: BLACK_FRIDAY_2026_LIFECYCLE_DISCOUNT_PERCENT,
	isLifecycle: true,
};

/**
 * The offer for a lifecycle experiment variation: 30% for treatment, the public 25% for
 * the control group and everyone outside the experiment.
 */
export function getBlackFriday2026OfferForVariation(
	variationName: string | null | undefined
): BlackFriday2026Offer {
	return variationName === 'treatment'
		? BLACK_FRIDAY_2026_LIFECYCLE_OFFER
		: BLACK_FRIDAY_2026_PUBLIC_OFFER;
}

/**
 * The offer a sale coupon stands for, or null for any other coupon.
 */
export function getBlackFriday2026OfferForCoupon(
	coupon: string | null | undefined
): BlackFriday2026Offer | null {
	return (
		[ BLACK_FRIDAY_2026_PUBLIC_OFFER, BLACK_FRIDAY_2026_LIFECYCLE_OFFER ].find(
			( offer ) => offer.coupon === coupon
		) ?? null
	);
}
