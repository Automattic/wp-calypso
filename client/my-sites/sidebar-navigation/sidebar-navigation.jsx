/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import SidebarNavigation from 'components/sidebar-navigation';
import AllSitesIcon from 'my-sites/all-sites-icon';
import SiteIcon from 'components/site-icon';
import { getSelectedSite } from 'state/ui/selectors';
import sitesFactory from 'lib/sites-list';

function SidebarNav( { translate, selectedSite } ) {
	const sites = sitesFactory();
	const currentSiteTitle = selectedSite ? selectedSite.title : translate( 'All Sites' );
	const allSitesClass = classNames( { 'all-sites': !! selectedSite } );

	return (
		<SidebarNavigation
			linkClassName={ allSitesClass }
			sectionName="site"
			sectionTitle={ currentSiteTitle }>
			{ selectedSite
				? <SiteIcon site={ selectedSite } size={ 30 } />
				: <AllSitesIcon sites={ sites.get() } /> }
		</SidebarNavigation>
	);
}

export default connect( ( state ) => {
	return { selectedSite: getSelectedSite( state ) };
} )( localize( SidebarNav ) );
