import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import {
	BLACK_FRIDAY_2026_LANDING_URL,
	BLACK_FRIDAY_2026_MONTHLY_SAVINGS_PERCENT,
	type BlackFriday2026Offer,
} from 'calypso/lib/promotions/black-friday-2026';
import { wpcomLink } from './link';

export interface BlackFriday2026CardCopy {
	title: string;
	description: string;
	ctaLabel: string;
}

/**
 * Copy for the Black Friday 2026 promo cards. The lifecycle offer uses the lifecycle copy doc's
 * in-product wording, the public offer keeps its own.
 */
export function getBlackFriday2026CardCopy( offer: BlackFriday2026Offer ): BlackFriday2026CardCopy {
	const { percent } = offer;
	/* translators: %(percent)d is the discount percentage, e.g. 25 */
	const ctaLabel = sprintf( __( 'Get %(percent)d%% off' ), { percent } );

	if ( offer.isLifecycle ) {
		return {
			/* translators: %(percent)d is the discount percentage, e.g. 30 */
			title: sprintf( __( '%(percent)d%% off annual plans' ), { percent } ),
			description: sprintf(
				/* translators: %(percent)d is the discount percentage, e.g. 30 */
				__( 'Upgrade today and pay %(percent)d%% less for your first year.' ),
				{ percent }
			),
			ctaLabel,
		};
	}

	return {
		/* translators: %(percent)d is the discount percentage, e.g. 25 */
		title: sprintf( __( '%(percent)d%% off annual and multi-year plans' ), { percent } ),
		description: sprintf(
			/* translators: %(savings)d is the largest saving compared with monthly billing, as a percentage, e.g. 66 */
			__( 'That’s up to %(savings)d%% less than paying monthly. Sale ends December 1.' ),
			{ savings: BLACK_FRIDAY_2026_MONTHLY_SAVINGS_PERCENT }
		),
		ctaLabel,
	};
}

/**
 * Where the sidebar card leads: the plans page with the lifecycle coupon, as in the lifecycle
 * emails, or the public sale's landing page.
 */
export function getBlackFriday2026SidebarHref( offer: BlackFriday2026Offer ): string {
	return offer.isLifecycle
		? addQueryArgs( wpcomLink( '/plans' ), { coupon: offer.coupon } )
		: BLACK_FRIDAY_2026_LANDING_URL;
}
