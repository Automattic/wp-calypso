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
import WritingForm from 'my-sites/site-settings/form-writing';
import { getSelectedSite } from 'state/ui/selectors';

const SiteSettingsWriting = ( {
	site,
	translate,
} ) => (
	<Main className="settings-writing__main site-settings">
		<DocumentHead title={ translate( 'Site Settings' ) } />
		<SidebarNavigation />
		<SiteSettingsNavigation site={ site } section="writing" />
		<WritingForm />
	</Main>
);

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} )
)( localize( SiteSettingsWriting ) );
