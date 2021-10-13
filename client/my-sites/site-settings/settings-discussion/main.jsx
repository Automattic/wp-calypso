import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import DiscussionForm from 'calypso/my-sites/site-settings/form-discussion';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import SiteSettingsNavigation from 'calypso/my-sites/site-settings/navigation';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const SiteSettingsDiscussion = ( { site, translate } ) => (
	<Main className="settings-discussion site-settings">
		<ScreenOptionsTab wpAdminPath="options-discussion.php" />
		<DocumentHead title={ translate( 'Discussion Settings' ) } />
		<JetpackDevModeNotice />
		<SidebarNavigation />
		<FormattedHeader
			brandFont
			className="settings-discussion__page-heading"
			headerText={ translate( 'Discussion Settings' ) }
			subHeaderText={ translate(
				'Control how people interact with your site through comments. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="discussion" showIcon={ false } />,
					},
				}
			) }
			align="left"
			hasScreenOptions
		/>
		<SiteSettingsNavigation site={ site } section="discussion" />
		<DiscussionForm />
	</Main>
);

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( localize( SiteSettingsDiscussion ) );
