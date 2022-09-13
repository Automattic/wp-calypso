import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import MainComponent from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

const Plans = () => {
	const translate = useTranslate();

	return (
		<MainComponent wideLayout>
			<PageViewTracker path={ '/plugins/plans' } title={ translate( 'Plugins > Plan Upgrade' ) } />
			<DocumentHead title={ translate( 'Plugins > Plan Upgrade' ) } />
		</MainComponent>
	);
};

export default Plans;
