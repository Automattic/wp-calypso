import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import HomeDashboard from './home-dashboard';

export default function CustomerHome() {
	const translate = useTranslate();

	return (
		<Main fullWidthLayout>
			<PageViewTracker path="/home/:site" title={ translate( 'Dashboard' ) } />
			<DocumentHead title={ translate( 'Dashboard' ) } />
			<HomeDashboard />
		</Main>
	);
}
