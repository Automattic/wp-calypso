import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import WritingForm from 'calypso/my-sites/site-settings/form-writing';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import SiteSettingsNavigation from 'calypso/my-sites/site-settings/navigation';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const SiteSettingsWriting = ( { site, translate } ) => (
	<Main className="settings-writing site-settings">
		<ScreenOptionsTab wpAdminPath="options-writing.php" />
		<DocumentHead title={ translate( 'Writing Settings' ) } />
		<JetpackDevModeNotice />
		<NavigationHeader
			navigationItems={ [] }
			title={ translate( 'Writing Settings' ) }
			subtitle={ translate( "Manage settings related to your site's content." ) }
		/>

		<SiteSettingsNavigation site={ site } section="writing" />
		<WritingForm />
	</Main>
);

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( localize( SiteSettingsWriting ) );
