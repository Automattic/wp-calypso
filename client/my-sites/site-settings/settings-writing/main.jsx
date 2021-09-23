import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import WritingForm from 'calypso/my-sites/site-settings/form-writing';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import SiteSettingsNavigation from 'calypso/my-sites/site-settings/navigation';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const SiteSettingsWriting = ( { site, translate } ) => (
	<Main className="settings-writing site-settings">
		<ScreenOptionsTab wpAdminPath="options-writing.php" />
		<DocumentHead title={ translate( 'Writing Settings' ) } />
		<JetpackDevModeNotice />
		<SidebarNavigation />
		<FormattedHeader
			brandFont
			className="settings-writing__page-heading"
			headerText={ translate( 'Writing Settings' ) }
			subHeaderText={ translate( "Manage settings related to your site's content." ) }
			align="left"
			hasScreenOptions
		/>
		<SiteSettingsNavigation site={ site } section="writing" />
		<WritingForm />
	</Main>
);

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( localize( SiteSettingsWriting ) );
