/**
 * Internal dependencies
 */
import isSiteUpgradeable from 'state/selectors/is-site-upgradeable';
import canJetpackSiteAutoUpdateFiles from 'state/sites/selectors/can-jetpack-site-auto-update-files';
import canJetpackSiteUpdateFiles from 'state/sites/selectors/can-jetpack-site-update-files';
import isJetpackSite from 'state/sites/selectors/is-jetpack-site';
import isJetpackSiteMainNetworkSite from 'state/sites/selectors/is-jetpack-site-main-network-site';
import isJetpackSiteSecondaryNetworkSite from 'state/sites/selectors/is-jetpack-site-secondary-network-site';

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
