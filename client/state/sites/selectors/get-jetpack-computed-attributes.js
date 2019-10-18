/**
 * Internal dependencies
 */
import isSiteUpgradeable from 'state/selectors/is-site-upgradeable';
import canJetpackSiteAutoUpdateFiles from './can-jetpack-site-auto-update-files';
import canJetpackSiteManage from './can-jetpack-site-manage';
import canJetpackSiteUpdateFiles from './can-jetpack-site-update-files';
import isJetpackSite from './is-jetpack-site';
import isJetpackSiteMainNetworkSite from './is-jetpack-site-main-network-site';
import isJetpackSiteSecondaryNetworkSite from './is-jetpack-site-secondary-network-site';
import siteHasMinimumJetpackVersion from './site-has-minimum-jetpack-version';

export default function getJetpackComputedAttributes( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return {};
	}
	return {
		hasMinimumJetpackVersion: siteHasMinimumJetpackVersion( state, siteId ),
		canAutoupdateFiles: canJetpackSiteAutoUpdateFiles( state, siteId ),
		canUpdateFiles: canJetpackSiteUpdateFiles( state, siteId ),
		canManage: canJetpackSiteManage( state, siteId ),
		isMainNetworkSite: isJetpackSiteMainNetworkSite( state, siteId ),
		isSecondaryNetworkSite: isJetpackSiteSecondaryNetworkSite( state, siteId ),
		isSiteUpgradeable: isSiteUpgradeable( state, siteId ),
	};
}
