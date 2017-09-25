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
import WritingForm from 'my-sites/site-settings/form-writing';
import JetpackDevModeNotice from 'my-sites/site-settings/jetpack-dev-mode-notice';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import Placeholder from 'my-sites/site-settings/placeholder';
import { getSelectedSite } from 'state/ui/selectors';

const SiteSettingsWriting = ( {
	site,
	translate,
} ) => {
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

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} )
)( localize( SiteSettingsWriting ) );
