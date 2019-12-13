/**
 * External dependencies
 */
import { get } from 'lodash';
import store from 'store';

const storeKeyForNeverShow = 'sitesNeverShowChecklistBanner';

const valueCache = {};

export function getNeverShowBannerStatus( siteId ) {
	if ( siteId in valueCache ) {
		return valueCache[ siteId ];
	}

	const sitesNeverShowBanner = store.get( storeKeyForNeverShow );
	const storedValue = get( sitesNeverShowBanner, String( siteId ) );
	valueCache[ siteId ] = storedValue;
	return storedValue;
}

export function setNeverShowBannerStatus( siteId, value ) {
	const sitesNeverShowBanner = store.get( storeKeyForNeverShow ) || {};
	sitesNeverShowBanner[ `${ siteId }` ] = value;
	store.set( storeKeyForNeverShow, sitesNeverShowBanner );
	valueCache[ siteId ] = value;
}
