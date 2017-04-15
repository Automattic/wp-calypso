/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import SidebarNavigation from 'components/sidebar-navigation';
import SiteIcon from 'blocks/site-icon';
import sitesFactory from 'lib/sites-list';

const sites = sitesFactory();

const MySitesSidebarNavigation = ( { translate } ) => {
	const site = sites.getSelectedSite();
	let currentSiteTitle = site.title,
		allSitesClass;

	if ( ! site ) {
		currentSiteTitle = translate( 'All Sites' );
		allSitesClass = 'all-sites';
	}

	return (
		<SidebarNavigation
			linkClassName={ allSitesClass }
			sectionName="site"
			sectionTitle={ currentSiteTitle }>
			{ site && <SiteIcon site={ site } /> }
		</SidebarNavigation>
	);
};

export default localize( MySitesSidebarNavigation );
