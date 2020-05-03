/**
 * External dependencies
 */
import { parse } from 'url';

/**
 * Internal dependencies
 */
import {
	hasRenewalItem,
	getRenewalItems,
	hasDomainRegistration,
	hasDomainMapping,
	hasProduct,
} from 'lib/cart-values/cart-items';
import { managePurchase } from 'me/purchases/paths';
import {
	UPGRADE_INTENT_PLUGINS,
	UPGRADE_INTENT_INSTALL_PLUGIN,
	UPGRADE_INTENT_THEMES,
	UPGRADE_INTENT_INSTALL_THEME,
} from 'lib/checkout/constants';
import { decodeURIComponentIfValid, isExternal } from 'lib/url';

const isValidValue = ( url ) => typeof url === 'string' && url;

export function isValidUpgradeIntent( upgradeIntent ) {
	switch ( upgradeIntent ) {
		case UPGRADE_INTENT_PLUGINS:
		case UPGRADE_INTENT_INSTALL_PLUGIN:
		case UPGRADE_INTENT_THEMES:
		case UPGRADE_INTENT_INSTALL_THEME:
			return true;
	}
	return false;
}

export function parseRedirectToChain( rawUrl, includeOriginalUrl = true ) {
	const redirectChain = [];
	const url = decodeURIComponentIfValid( rawUrl );

	if ( includeOriginalUrl && isValidValue( url ) ) {
		redirectChain.push( url );
	}

	const parseUrlAndPushToChain = ( currentUrl ) => {
		const {
			query: { redirect_to },
		} = parse( currentUrl, true );
		if ( isValidValue( redirect_to ) ) {
			redirectChain.push( redirect_to );
			parseUrlAndPushToChain( decodeURIComponentIfValid( redirect_to ) );
		}
	};

	parseUrlAndPushToChain( url );
	return redirectChain;
}

export function getValidDeepRedirectTo( redirectTo ) {
	const redirectChain = parseRedirectToChain( redirectTo );
	if (
		Array.isArray( redirectChain ) &&
		redirectChain.length &&
		! isExternal( redirectChain[ redirectChain.length - 1 ] )
	) {
		return redirectChain[ redirectChain.length - 1 ];
	}
}

export function getExitCheckoutUrl( cart, siteSlug, upgradeIntent, redirectTo ) {
	let url = '/plans/';

	if ( hasRenewalItem( cart ) ) {
		const { purchaseId, purchaseDomain } = getRenewalItems( cart )[ 0 ].extra,
			siteName = siteSlug || purchaseDomain;

		return managePurchase( siteName, purchaseId );
	}

	if ( isValidUpgradeIntent( upgradeIntent ) ) {
		const finalRedirectTo = getValidDeepRedirectTo( redirectTo );
		if ( finalRedirectTo ) {
			return finalRedirectTo;
		}
	}

	if ( hasDomainRegistration( cart ) ) {
		url = '/domains/add/';
	} else if ( hasDomainMapping( cart ) ) {
		url = '/domains/add/mapping/';
	} else if ( hasProduct( cart, 'offsite_redirect' ) ) {
		url = '/domains/add/site-redirect/';
	} else if ( hasProduct( cart, 'premium_theme' ) ) {
		url = '/themes/';
	}

	return siteSlug ? url + siteSlug : url;
}

export { getCreditCardType, validatePaymentDetails } from './validation';
export { maskField, unmaskField } from './masking';
