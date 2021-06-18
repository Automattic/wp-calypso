/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import WritingForm from 'calypso/my-sites/site-settings/form-writing';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import config from '@automattic/calypso-config';

const SiteSettingsWriting = ( { translate } ) => (
	<Main className="settings-writing site-settings">
		<ScreenOptionsTab wpAdminPath="options-writing.php" />
		<DocumentHead title={ translate( 'Site Settings' ) } />
		<JetpackDevModeNotice />
		<SidebarNavigation />
		<FormattedHeader
			brandFont
			className="settings-writing__page-heading"
			headerText={ translate( 'Settings' ) }
			subHeaderText={ translate(
				"Manage categories, tags, and other settings related to your site's content."
			) }
			align="left"
			hasScreenOptions={ config.isEnabled( 'nav-unification/switcher' ) }
		/>
		<WritingForm />
	</Main>
);

export default localize( SiteSettingsWriting );
