import config from '@automattic/calypso-config';
import {
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
} from '@automattic/calypso-products';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { trackStatsAnalyticsEvent } from '../utils';

const setUrlParam = ( url: URL, paramName: string, paramValue?: string | null ): void => {
	if ( paramValue === null || paramValue === undefined || paramValue === '' ) {
		url.searchParams.delete( paramName );
	} else {
		url.searchParams.set( paramName, paramValue );
	}
};

const getStatsCheckoutURL = (
	siteSlug: string,
	siteId: number | null,
	product: string,
	redirectUrl: string,
	checkoutBackUrl: string,
	from?: string,
	adminUrl?: string,
	isUpgrade?: boolean,
	isSiteFullyConnected?: boolean
) => {
	const isFromWpAdmin = config.isEnabled( 'is_running_in_jetpack_site' );

	// Get the checkout URL for the product, or the siteless checkout URL if there's no siteId or Jetpack is not fully
	// connected (site and user):
	let checkoutType;
	let doRedirectToSitelessIfNotLoggedIn = false;
	let isSitelessCheckout = false;

	// A NOTE: For normal checkout (not siteless), in the checkout url, if you use the siteId in place of the siteSlug, and
	// also add a `source=my-jetpack` query param, then the Calypso routing middleware will redirect to siteless checkout
	// when the user is Not logged-in (instead of redirecting to login page), otherwise if logged-in then it's logged-in
	// checkout as usual.

	if ( siteId && siteSlug ) {
		// We know what site it is
		if ( isFromWpAdmin ) {
			// We know the site and we're in wp-admin of the plugin
			if ( isSiteFullyConnected ) {
				// The plugin is site & user connected
				if ( isUpgrade ) {
					checkoutType = siteSlug; // Go to normal checkout (will redirect to login, if not logged-in)
				} else {
					doRedirectToSitelessIfNotLoggedIn = true;
					checkoutType = siteId; // Go to normal checkout (will redirect to siteless checkout, if not logged-in)
				}
			} else {
				// The plugin is Not fully connected
				isSitelessCheckout = true;
				checkoutType = 'jetpack'; // go to siteless checkout
			}
		} else {
			// We know the site and we're in Calypso
			checkoutType = siteSlug; // go to normal checkout (with site and user context (logged-in))
		}
	} else {
		// We don't know the site and we're in Calypso
		checkoutType = 'jetpack'; // go to siteless checkout
	}

	const checkoutProductUrl = new URL(
		`/checkout/${ checkoutType }/${ product }`,
		'https://wordpress.com'
	);

	// Set URL parameters
	if ( isSitelessCheckout ) {
		setUrlParam( checkoutProductUrl, 'connect_after_checkout', 'true' );
		setUrlParam( checkoutProductUrl, 'admin_url', adminUrl );
		setUrlParam( checkoutProductUrl, 'from_site_slug', siteSlug );
	}
	if ( doRedirectToSitelessIfNotLoggedIn ) {
		setUrlParam( checkoutProductUrl, 'site', siteSlug );
		setUrlParam( checkoutProductUrl, 'source', 'my-jetpack' );
	}

	// Add redirect_to parameter
	setUrlParam( checkoutProductUrl, 'redirect_to', redirectUrl );
	setUrlParam( checkoutProductUrl, 'checkoutBackUrl', checkoutBackUrl );

	return checkoutProductUrl.toString();
};

const getYearlyPrice = ( monthlyPrice: number ) => {
	return monthlyPrice * 12;
};

const addPurchaseTypeToUri = ( uri: string, statsPurchaseSuccess: string ) => {
	const url = new URL( uri, window.location.origin );
	setUrlParam( url, 'statsPurchaseSuccess', statsPurchaseSuccess );

	return url.pathname + url.search;
};

const getCheckoutBackUrl = ( {
	from,
	siteSlug,
	adminUrl,
}: {
	from: string;
	siteSlug: string;
	adminUrl?: string;
} ) => {
	const isFromWPAdmin = config.isEnabled( 'is_running_in_jetpack_site' );
	const isFromMyJetpack = from === 'jetpack-my-jetpack';
	const isFromPlansPage = from === 'calypso-plans';

	// Use full URL even though redirecting on Calypso.
	if ( ! isFromWPAdmin ) {
		if ( ! siteSlug ) {
			return 'https://cloud.jetpack.com/pricing/';
		}

		return (
			window.location.origin +
			( isFromPlansPage ? `/plans/${ siteSlug }` : `/stats/day/${ siteSlug }` )
		);
	}

	const checkoutBackPath = isFromMyJetpack ? 'admin.php?page=my-jetpack' : 'admin.php?page=stats';
	return adminUrl + checkoutBackPath.replace( /^\//, '' );
};

const getRedirectUrl = ( {
	type,
	adminUrl,
	redirectUri,
	siteSlug,
}: {
	type: string;
	adminUrl?: string;
	redirectUri?: string;
	siteSlug: string;
} ) => {
	const isFromWPAdmin = config.isEnabled( 'is_running_in_jetpack_site' );
	const statsPurchaseSuccess = type === 'free' ? 'free' : 'paid';

	// If it's a siteless checkout, let it redirect to the thank you page,
	// which is the default page if nothing is passed
	if ( ! siteSlug ) {
		return '';
	}

	if ( ! isFromWPAdmin ) {
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
	siteId,
	adminUrl,
	redirectUri,
	price,
	quantity,
	isUpgrade = false,
	isSiteFullyConnected = true,
	redirect = true,
}: {
	from: string;
	type: 'pwyw' | 'free' | 'commercial';
	siteSlug: string;
	siteId: number | null;
	adminUrl?: string;
	redirectUri?: string;
	price?: number;
	quantity?: number;
	isUpgrade?: boolean;
	isSiteFullyConnected?: boolean;
	redirect?: boolean;
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
			eventName = 'commercial';
			product = quantity
				? `${ PRODUCT_JETPACK_STATS_YEARLY }:-q-${ quantity }`
				: PRODUCT_JETPACK_STATS_YEARLY;

			break;
	}

	// Keeping the event for data continuity
	recordTracksEvent( `calypso_stats_${ eventName }_purchase_button_clicked` );
	// Add parameters to the event
	trackStatsAnalyticsEvent( 'stats_purchase_button_clicked', {
		type,
		quantity,
	} );

	const redirectUrl = getRedirectUrl( { type, adminUrl, redirectUri, siteSlug } );
	const checkoutBackUrl = getCheckoutBackUrl( { from, adminUrl, siteSlug } );

	// Allow some time for the event to be recorded before redirecting.
	if ( ! redirect ) {
		return getStatsCheckoutURL(
			siteSlug,
			siteId,
			product,
			redirectUrl,
			checkoutBackUrl,
			from,
			adminUrl,
			isUpgrade,
			isSiteFullyConnected
		);
	}
	setTimeout(
		() =>
			( window.location.href = getStatsCheckoutURL(
				siteSlug,
				siteId,
				product,
				redirectUrl,
				checkoutBackUrl,
				from,
				adminUrl,
				isUpgrade,
				isSiteFullyConnected
			) ),
		250
	);
};

export default gotoCheckoutPage;
