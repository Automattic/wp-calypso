/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DiscussionForm from 'my-sites/site-settings/form-discussion';
import DocumentHead from 'components/data/document-head';
import JetpackDevModeNotice from 'my-sites/site-settings/jetpack-dev-mode-notice';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import { getSelectedSite } from 'state/ui/selectors';

const SiteSettingsDiscussion = ( { site, translate } ) => (
	<Main className="settings-discussion site-settings">
		<DocumentHead title={ translate( 'Site Settings' ) } />
		<JetpackDevModeNotice />
		<SidebarNavigation />
		<SiteSettingsNavigation site={ site } section="discussion" />
		<DiscussionForm />
	</Main>
);

export default connect( state => ( {
	site: getSelectedSite( state ),
} ) )( localize( SiteSettingsDiscussion ) );
