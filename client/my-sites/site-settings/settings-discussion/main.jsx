/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DiscussionForm from 'calypso/my-sites/site-settings/form-discussion';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import SiteSettingsNavigation from 'calypso/my-sites/site-settings/navigation';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const SiteSettingsDiscussion = ( { site, translate } ) => (
	<Main className="settings-discussion site-settings">
		<DocumentHead title={ translate( 'Site Settings' ) } />
		<JetpackDevModeNotice />
		<SidebarNavigation />
		<FormattedHeader
			brandFont
			className="settings-discussion__page-heading"
			headerText={ translate( 'Settings' ) }
			align="left"
		/>
		<SiteSettingsNavigation site={ site } section="discussion" />
		<DiscussionForm />
	</Main>
);

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( localize( SiteSettingsDiscussion ) );
