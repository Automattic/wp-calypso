/**
 * External dependencies
 */
import { parse } from 'url'; // eslint-disable-line no-restricted-imports

/**
 * Internal dependencies
 */
import {
	UPGRADE_INTENT_PLUGINS,
	UPGRADE_INTENT_INSTALL_PLUGIN,
	UPGRADE_INTENT_THEMES,
	UPGRADE_INTENT_INSTALL_THEME,
} from 'calypso/lib/checkout/constants';
import { decodeURIComponentIfValid, isExternal } from 'calypso/lib/url';

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

export { getCreditCardType, validatePaymentDetails } from './validation';
export { maskField, unmaskField } from './masking';
