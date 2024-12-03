import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import DiscussionForm from 'calypso/my-sites/site-settings/form-discussion';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import SiteSettingsNavigation from 'calypso/my-sites/site-settings/navigation';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const SiteSettingsDiscussion = ( { site, translate } ) => (
	<Main className="settings-discussion site-settings">
		<DocumentHead title={ translate( 'Discussion Settings' ) } />
		<JetpackDevModeNotice />
		<NavigationHeader
			screenOptionsTab="options-discussion.php"
			navigationItems={ [] }
			title={ translate( 'Discussion Settings' ) }
			subtitle={ translate(
				'Control how people interact with your site through comments. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="discussion" showIcon={ false } />,
					},
				}
			) }
		/>

		<SiteSettingsNavigation site={ site } section="discussion" />
		<DiscussionForm />
	</Main>
);

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( localize( SiteSettingsDiscussion ) );
