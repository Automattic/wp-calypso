import getJetpackModules from 'calypso/state/selectors/get-jetpack-modules';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';

export default function isManualSeoAvailable( state, siteId ) {
	if ( ! getRawSite( state, siteId ) || isVipSite( state, siteId ) ) {
		return false;
	}

	return (
		! isJetpackSite( state, siteId ) ||
		( getJetpackModules( state, siteId )?.[ 'seo-tools' ]?.available ?? false )
	);
}
