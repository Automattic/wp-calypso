/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import QueryProductsList from 'components/data/query-products-list';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getSelectedSiteId } from 'state/ui/selectors';
import GeneralSettings from './section-general';
import SiteSettingsNavigation from './navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import JetpackDevModeNotice from './jetpack-dev-mode-notice';
import Placeholder from 'my-sites/site-settings/placeholder';

const SiteSettingsComponent = ( {
	siteId,
	translate
} ) => {
	if ( ! siteId ) {
		return <Placeholder />;
	}

	return (
		<Main className="site-settings">
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			{ siteId && <SiteSettingsNavigation section={ 'general' } /> }
			<QueryProductsList />
			{ siteId && <QuerySitePurchases siteId={ siteId } /> }
			{ siteId && <GeneralSettings /> }
		</Main>
	);
};

SiteSettingsComponent.propTypes = {
	// Connected props
	siteId: PropTypes.number,
};

export default connect(
	( state ) => ( {
		siteId: getSelectedSiteId( state ),
	} )
)( localize( SiteSettingsComponent ) );
