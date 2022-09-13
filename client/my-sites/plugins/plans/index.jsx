import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import MainComponent from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import useScrollAboveElement from 'calypso/lib/use-scroll-above-element';
import PluginsNavigationHeader from '../plugins-navigation-header';

const Plans = () => {
	const { referenceRef: navigationHeaderRef } = useScrollAboveElement();

	const translate = useTranslate();

	return (
		<MainComponent wideLayout>
			<PageViewTracker path="/plugins/plans/:site" title="Plugins > Plan Upgrade" />
			<DocumentHead title={ translate( 'Plugins > Plan Upgrade' ) } />

			<PluginsNavigationHeader
				navigationHeaderRef={ navigationHeaderRef }
				categoryName={ translate( 'Plan Upgrade' ) }
				category={ 'something needs to be here so that the top can show' }
			/>
		</MainComponent>
	);
};

export default Plans;
