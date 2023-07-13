import {
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
} from '@automattic/calypso-products';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const getStatsPurchaseURL = ( siteSlug: string, page: string ) => {
	const purchasePath = `/checkout/${ siteSlug }/${ page }`;

	return `https://wordpress.com${ purchasePath }`;
};

const gotoCheckoutPage = ( type: 'pwyw' | 'free' | 'commercial', siteSlug: string ) => {
	let eventName = '';
	let page: string;

	switch ( type ) {
		case 'pwyw':
			// YEARLY!
			eventName = 'pwyw';
			page = PRODUCT_JETPACK_STATS_PWYW_YEARLY;
			break;
		case 'free':
			eventName = 'free';
			page = PRODUCT_JETPACK_STATS_FREE;
			break;
		case 'commercial':
			// MONTHLY!
			eventName = 'commercial';
			page = PRODUCT_JETPACK_STATS_MONTHLY;
			break;
	}

	recordTracksEvent( `calypso_stats_${ eventName }_purchase_button_clicked` );

	// Allow some time for the event to be recorded before redirecting.
	setTimeout( () => ( window.location.href = getStatsPurchaseURL( siteSlug, page ) ), 250 );
};

export default gotoCheckoutPage;
