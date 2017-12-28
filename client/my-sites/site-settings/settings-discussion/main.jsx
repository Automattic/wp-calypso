/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'client/components/main';
import DocumentHead from 'client/components/data/document-head';
import SidebarNavigation from 'client/my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'client/my-sites/site-settings/navigation';
import DiscussionForm from 'client/my-sites/site-settings/form-discussion';
import JetpackDevModeNotice from 'client/my-sites/site-settings/jetpack-dev-mode-notice';
import Placeholder from 'client/my-sites/site-settings/placeholder';
import { getSelectedSite } from 'client/state/ui/selectors';

const SiteSettingsDiscussion = ( { site, translate } ) => {
	if ( ! site ) {
		return <Placeholder />;
	}

	return (
		<Main className="settings-discussion site-settings">
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<SiteSettingsNavigation site={ site } section="discussion" />
			<DiscussionForm />
		</Main>
	);
};

export default connect( state => ( {
	site: getSelectedSite( state ),
} ) )( localize( SiteSettingsDiscussion ) );
