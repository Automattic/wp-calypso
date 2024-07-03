import ItemPreviewPaneFooter from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/item-preview-pane-footer';
import DocumentHead from 'calypso/components/data/document-head';
import BoostSitePerformance from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-expanded-content/boost-site-performance';
import { Site } from '../../types';

type Props = {
	site: Site;
	trackEvent: ( eventName: string ) => void;
	hasError?: boolean;
};

export function JetpackBoostPreview( { site, trackEvent, hasError = false }: Props ) {
	return (
		<>
			<DocumentHead title="Boost" />
			<div className="site-preview-pane__boost-content">
				<BoostSitePerformance site={ site } trackEvent={ trackEvent } hasError={ hasError } />
			</div>
			<ItemPreviewPaneFooter />
		</>
	);
}
