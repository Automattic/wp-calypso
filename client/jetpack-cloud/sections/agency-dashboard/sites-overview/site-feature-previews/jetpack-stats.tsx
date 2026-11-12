import InsightsStats from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-expanded-content/insights-stats';
import SitePreviewPaneContent from '../site-preview-pane/site-preview-pane-content';
import SitePreviewPaneFooter from '../site-preview-pane/site-preview-pane-footer';
import { Site } from '../types';

type Props = {
	site: Site;
	trackEvent: ( eventName: string ) => void;
};

export function JetpackStatsPreview( { site, trackEvent }: Props ) {
	return (
		<>
			<SitePreviewPaneContent>
				<InsightsStats
					stats={ site.site_stats }
					siteUrlWithScheme={ site.url_with_scheme }
					trackEvent={ trackEvent }
				/>
			</SitePreviewPaneContent>
			<SitePreviewPaneFooter />
		</>
	);
}
