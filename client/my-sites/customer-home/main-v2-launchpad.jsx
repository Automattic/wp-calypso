import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import LaunchpadPreLaunch from './cards/launchpad/pre-launch';

function LaunchpadOnlyHome() {
	const translate = useTranslate();

	return (
		<Main wideLayout>
			<PageViewTracker path="/home/:site" title={ translate( 'My Home' ) } />
			<DocumentHead title={ translate( 'My Home' ) } />
			<LaunchpadPreLaunch />
		</Main>
	);
}

export default connect( ( state ) => ( {
	siteId: getSelectedSiteId( state ),
} ) )( LaunchpadOnlyHome );
