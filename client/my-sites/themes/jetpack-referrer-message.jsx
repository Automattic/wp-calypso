/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import CurrentTheme from 'calypso/my-sites/themes/current-theme';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import EmptyContent from 'calypso/components/empty-content';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';

const JetpackReferrerMessage = ( {
	siteId,
	translate,
	adminUrl,
	analyticsPath,
	analyticsPageTitle,
} ) => (
	<Main className="themes">
		<PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />
		<SidebarNavigation />
		<CurrentTheme siteId={ siteId } />
		<EmptyContent
			title={ translate( 'Changing Themes?' ) }
			line={ translate( 'Use your site theme browser to manage themes.' ) }
			action={ translate( 'Open Site Theme Browser' ) }
			actionURL={ adminUrl }
			actionTarget="_blank"
			illustration="/calypso/images/illustrations/illustration-jetpack.svg"
		/>
	</Main>
);

export default connect( ( state, { siteId } ) => ( {
	adminUrl: getSiteAdminUrl( state, siteId, 'themes.php' ),
} ) )( localize( JetpackReferrerMessage ) );
