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
import JetpackDevModeNotice from 'client/my-sites/site-settings/jetpack-dev-mode-notice';
import SidebarNavigation from 'client/my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'client/my-sites/site-settings/navigation';
import WritingForm from 'client/my-sites/site-settings/form-writing';
import Placeholder from 'client/my-sites/site-settings/placeholder';
import { getSelectedSite } from 'client/state/ui/selectors';

const SiteSettingsWriting = ( { site, translate } ) => {
	if ( ! site ) {
		return <Placeholder />;
	}

	return (
		<Main className="settings-writing site-settings">
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<SiteSettingsNavigation site={ site } section="writing" />
			<WritingForm />
		</Main>
	);
};

export default connect( state => ( {
	site: getSelectedSite( state ),
} ) )( localize( SiteSettingsWriting ) );
