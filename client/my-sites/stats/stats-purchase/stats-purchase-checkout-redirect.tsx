import {
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
} from '@automattic/calypso-products';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const getStatsPurchaseURL = ( siteSlug: string, product: string ) => {
	const purchasePath = `/checkout/${ siteSlug }/${ product }`;

	return `https://wordpress.com${ purchasePath }`;
};

const getYearlyPrice = ( monthlyPrice: number ) => {
	return monthlyPrice * 12;
};

const gotoCheckoutPage = (
	type: 'pwyw' | 'free' | 'commercial',
	siteSlug: string,
	price?: number
) => {
	let eventName = '';
	let product: string;

	switch ( type ) {
		case 'pwyw':
			// YEARLY!
			eventName = 'pwyw';
			product = price
				? `${ PRODUCT_JETPACK_STATS_PWYW_YEARLY }:-q-${ getYearlyPrice( price ) }` // specify price per unit or the plan will default to a free plan
				: `${ PRODUCT_JETPACK_STATS_PWYW_YEARLY }`;
			break;
		case 'free':
			eventName = 'free';
			product = PRODUCT_JETPACK_STATS_FREE;
			break;
		case 'commercial':
			// MONTHLY!
			eventName = 'commercial';
			product = PRODUCT_JETPACK_STATS_MONTHLY;
			break;
	}

	recordTracksEvent( `calypso_stats_${ eventName }_purchase_button_clicked` );

	// Allow some time for the event to be recorded before redirecting.
	setTimeout( () => ( window.location.href = getStatsPurchaseURL( siteSlug, product ) ), 250 );
};

export default gotoCheckoutPage;
