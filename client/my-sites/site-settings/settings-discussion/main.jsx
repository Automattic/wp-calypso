/**
 * External dependencies
 */
import React from 'react';
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
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import config from '@automattic/calypso-config';

const SiteSettingsDiscussion = ( { translate } ) => (
	<Main className="settings-discussion site-settings">
		<ScreenOptionsTab wpAdminPath="options-discussion.php" />
		<DocumentHead title={ translate( 'Site Settings' ) } />
		<JetpackDevModeNotice />
		<SidebarNavigation />
		<FormattedHeader
			brandFont
			className="settings-discussion__page-heading"
			headerText={ translate( 'Settings' ) }
			subHeaderText={ translate( 'Control how people interact with your site through comments.' ) }
			align="left"
			hasScreenOptions={ config.isEnabled( 'nav-unification/switcher' ) }
		/>
		<DiscussionForm />
	</Main>
);

export default localize( SiteSettingsDiscussion );
