import {
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
} from '@automattic/calypso-products';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const getStatsPurchaseURL = ( siteSlug: string, product: string, redirectUrl: string ) => {
	const checkoutUrl = new URL( 'https://wordpress.com/checkout/' );
	const checkoutProductUrl = new URL( `${ checkoutUrl }${ siteSlug }/${ product }` );

	// Add redirect_to parameter
	if ( redirectUrl ) {
		checkoutProductUrl.searchParams.set( 'redirect_to', redirectUrl ); // TODO: add a redirect URL with query parameter showing proper success/fail banner
	} else {
		checkoutProductUrl.searchParams.set(
			'redirect_to',
			`https://wordpress.com/stats/${ siteSlug }`
		);
	}

	return checkoutProductUrl.toString();
};

const getYearlyPrice = ( monthlyPrice: number ) => {
	return monthlyPrice * 12;
};

const addPurchaseTypeToUri = ( uri: string, statsPurchaseSuccess: string ) => {
	const url = new URL( uri, 'https://wordpress.com' );
	url.searchParams.set( 'statsPurchaseSuccess', statsPurchaseSuccess );
	return url.pathname + url.search;
};

const getRedirectUrl = ( from: string, type: string, adminUrl?: string, redirectUri?: string ) => {
	const isFromJetpack = from.startsWith( 'jetpack' );
	const statsPurchaseSuccess = type === 'free' ? 'free' : 'paid';
	if ( ! isFromJetpack ) {
		// TODO: add siteSlug to the redirect URL
		redirectUri = addPurchaseTypeToUri( redirectUri || '/stats/day', statsPurchaseSuccess );
		return redirectUri;
	}
	redirectUri = addPurchaseTypeToUri( redirectUri || 'admin.php?page=stats', statsPurchaseSuccess );
	return adminUrl + redirectUri;
};

const gotoCheckoutPage = (
	from: string,
	type: 'pwyw' | 'free' | 'commercial',
	siteSlug: string,
	adminUrl?: string,
	redirectUri?: string,
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

	const redirectUrl = getRedirectUrl( from, type, adminUrl, redirectUri );

	// Allow some time for the event to be recorded before redirecting.
	setTimeout(
		() => ( window.location.href = getStatsPurchaseURL( siteSlug, product, redirectUrl ) ),
		250
	);
};

export default gotoCheckoutPage;
