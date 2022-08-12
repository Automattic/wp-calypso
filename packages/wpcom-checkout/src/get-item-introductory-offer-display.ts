import { translate } from 'i18n-calypso';
import { getIntroductoryOfferIntervalDisplay } from './get-introductory-offer-interval-display';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export function getItemIntroductoryOfferDisplay( product: ResponseCartProduct ) {
	if ( product.introductory_offer_terms?.reason ) {
		const text = translate( 'Order not eligible for introductory discount' );
		return { enabled: false, text };
	}

	if ( ! product.introductory_offer_terms?.enabled ) {
		return null;
	}

	const isFreeTrial = product.item_subtotal_integer === 0;
	const text = getIntroductoryOfferIntervalDisplay(
		product.introductory_offer_terms.interval_unit,
		product.introductory_offer_terms.interval_count,
		isFreeTrial,
		'checkout',
		product.introductory_offer_terms.transition_after_renewal_count
	);

	return { enabled: true, text };
}
