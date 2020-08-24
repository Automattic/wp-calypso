/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import SidebarNavigation from 'components/sidebar-navigation';
import SiteIcon from 'blocks/site-icon';
import { getSelectedSite } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

function MySitesSidebarNavigation( { site } ) {
	const translate = useTranslate();
	const currentSiteTitle = site ? site.title : translate( 'All Sites' );

	return (
		<SidebarNavigation sectionTitle={ currentSiteTitle }>
			{ site && <SiteIcon site={ site } /> }
		</SidebarNavigation>
	);
}

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( MySitesSidebarNavigation );
