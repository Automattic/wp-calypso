/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import SidebarNavigation from 'components/sidebar-navigation';
import SiteIcon from 'blocks/site-icon';
import { getSelectedSite } from 'state/ui/selectors';

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
			sectionTitle={ currentSiteTitle }>
			{ site && <SiteIcon site={ site } /> }
		</SidebarNavigation>
	);
};

export default connect(
	( state ) => ( {
		site: getSelectedSite( state )
	} )
)( localize( MySitesSidebarNavigation ) );
