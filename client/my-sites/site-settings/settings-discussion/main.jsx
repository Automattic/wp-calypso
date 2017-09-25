/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import DiscussionForm from 'my-sites/site-settings/form-discussion';
import JetpackDevModeNotice from 'my-sites/site-settings/jetpack-dev-mode-notice';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import Placeholder from 'my-sites/site-settings/placeholder';
import { getSelectedSite } from 'state/ui/selectors';

const SiteSettingsDiscussion = ( {
	site,
	translate,
} ) => {
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

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} )
)( localize( SiteSettingsDiscussion ) );
