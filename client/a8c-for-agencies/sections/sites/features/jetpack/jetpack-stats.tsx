import ItemPreviewPaneFooter from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/item-preview-pane-footer';
import DocumentHead from 'calypso/components/data/document-head';
import InsightsStats from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-expanded-content/insights-stats';
import { Site } from '../../types';

type Props = {
	site: Site;
	trackEvent: ( eventName: string ) => void;
};

export function JetpackStatsPreview( { site, trackEvent }: Props ) {
	return (
		<>
			<DocumentHead title="Stats" />
			<div className="site-preview-pane__stats-content">
				<InsightsStats
					stats={ site.site_stats }
					siteUrlWithScheme={ site.url_with_scheme }
					trackEvent={ trackEvent }
				/>
			</div>
			<ItemPreviewPaneFooter />
		</>
	);
}
