import {
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
} from '@automattic/calypso-products';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const getStatsPurchaseURL = ( siteSlug: string, product: string, redirectUrl: string ) => {
	const checkoutProductUrl = new URL(
		`/checkout/${ siteSlug }/${ product }`,
		window.location.origin
	);

	// Add redirect_to parameter
	checkoutProductUrl.searchParams.set( 'redirect_to', redirectUrl );

	return checkoutProductUrl.pathname + checkoutProductUrl.search;
};

const getYearlyPrice = ( monthlyPrice: number ) => {
	return monthlyPrice * 12;
};

const addPurchaseTypeToUri = ( uri: string, statsPurchaseSuccess: string ) => {
	const url = new URL( uri, window.location.origin );
	url.searchParams.set( 'statsPurchaseSuccess', statsPurchaseSuccess );
	return url.pathname + url.search;
};

const getRedirectUrl = ( {
	from,
	type,
	adminUrl,
	redirectUri,
	siteSlug,
}: {
	from: string;
	type: string;
	adminUrl?: string;
	redirectUri?: string;
	siteSlug: string;
} ) => {
	const isStartedFromJetpackSite = from.startsWith( 'jetpack' );
	const statsPurchaseSuccess = type === 'free' ? 'free' : 'paid';

	if ( ! isStartedFromJetpackSite ) {
		redirectUri = addPurchaseTypeToUri(
			redirectUri || `/stats/day/${ siteSlug }`,
			statsPurchaseSuccess
		);
		return redirectUri;
	}
	redirectUri = addPurchaseTypeToUri( redirectUri || 'admin.php?page=stats', statsPurchaseSuccess );
	return adminUrl + redirectUri.replace( /^\//, '' );
};

const gotoCheckoutPage = ( {
	from,
	type,
	siteSlug,
	adminUrl,
	redirectUri,
	price,
}: {
	from: string;
	type: 'pwyw' | 'free' | 'commercial';
	siteSlug: string;
	adminUrl?: string;
	redirectUri?: string;
	price?: number;
} ) => {
	let eventName = '';
	let product: string;

	switch ( type ) {
		case 'pwyw':
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
			// Default to yearly/annual billing
			eventName = 'commercial';
			product = PRODUCT_JETPACK_STATS_YEARLY;
			break;
	}

	recordTracksEvent( `calypso_stats_${ eventName }_purchase_button_clicked` );

	const redirectUrl = getRedirectUrl( { from, type, adminUrl, redirectUri, siteSlug } );

	// Allow some time for the event to be recorded before redirecting.
	setTimeout(
		() => ( window.location.href = getStatsPurchaseURL( siteSlug, product, redirectUrl ) ),
		250
	);
};

export default gotoCheckoutPage;
