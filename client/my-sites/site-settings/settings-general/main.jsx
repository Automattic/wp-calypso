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
import GeneralForm from 'my-sites/site-settings/form-general';
import SiteTools from 'my-sites/site-settings/site-tools';
import { getSelectedSite } from 'state/ui/selectors';

const SiteSettingsGeneral = ( {
	site,
	translate,
} ) => (
	<Main className="settings-general site-settings">
		<DocumentHead title={ translate( 'Site Settings' ) } />
		<SidebarNavigation />
		<SiteSettingsNavigation site={ site } section="general" />
		<GeneralForm site={ site } />
		<SiteTools />
	</Main>
);

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} )
)( localize( SiteSettingsGeneral ) );
