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
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import DiscussionForm from 'my-sites/site-settings/form-discussion';
import JetpackDevModeNotice from 'my-sites/site-settings/jetpack-dev-mode-notice';
import Placeholder from 'my-sites/site-settings/placeholder';
import { getSelectedSite } from 'state/ui/selectors';

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
