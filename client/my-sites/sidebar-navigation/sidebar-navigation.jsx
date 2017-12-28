/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import SidebarNavigation from 'client/components/sidebar-navigation';
import SiteIcon from 'client/blocks/site-icon';
import { getSelectedSite } from 'client/state/ui/selectors';

const MySitesSidebarNavigation = ( { site, translate } ) => {
	let currentSiteTitle = translate( 'All Sites' ),
		allSitesClass = 'all-sites';

	if ( site ) {
		currentSiteTitle = site.title;
		allSitesClass = null;
	}

	return (
		<SidebarNavigation
			linkClassName={ allSitesClass }
			sectionName="site"
			sectionTitle={ currentSiteTitle }
		>
			{ site && <SiteIcon site={ site } /> }
		</SidebarNavigation>
	);
};

export default connect( state => ( {
	site: getSelectedSite( state ),
} ) )( localize( MySitesSidebarNavigation ) );
