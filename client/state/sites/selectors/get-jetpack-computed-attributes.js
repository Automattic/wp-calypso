/**
 * Internal dependencies
 */
import isSiteUpgradeable from 'calypso/state/selectors/is-site-upgradeable';
import canJetpackSiteAutoUpdateFiles from './can-jetpack-site-auto-update-files';
import canJetpackSiteUpdateFiles from './can-jetpack-site-update-files';
import isJetpackSite from './is-jetpack-site';
import isJetpackSiteMainNetworkSite from './is-jetpack-site-main-network-site';
import isJetpackSiteSecondaryNetworkSite from './is-jetpack-site-secondary-network-site';

export default function getJetpackComputedAttributes( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return {};
	}
	return {
		canAutoupdateFiles: canJetpackSiteAutoUpdateFiles( state, siteId ),
		canUpdateFiles: canJetpackSiteUpdateFiles( state, siteId ),
		isMainNetworkSite: isJetpackSiteMainNetworkSite( state, siteId ),
		isSecondaryNetworkSite: isJetpackSiteSecondaryNetworkSite( state, siteId ),
		isSiteUpgradeable: isSiteUpgradeable( state, siteId ),
	};
}
