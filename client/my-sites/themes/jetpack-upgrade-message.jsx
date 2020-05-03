/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import { getSiteAdminUrl } from 'state/sites/selectors';

const JetpackUpgradeMessage = ( { siteId, translate, adminUrl } ) => (
	<Main className="themes">
		<SidebarNavigation />
		<JetpackManageErrorPage
			template="updateJetpack"
			siteId={ siteId }
			version="3.7"
			secondaryAction={ translate( 'Open Site Theme Browser' ) }
			secondaryActionURL={ adminUrl }
			secondaryActionTarget="_blank"
		/>
	</Main>
);

export default connect( ( state, { siteId } ) => ( {
	adminUrl: getSiteAdminUrl( state, siteId, 'themes.php' ),
} ) )( localize( JetpackUpgradeMessage ) );
