import DocumentHead from 'calypso/components/data/document-head';
import InsightsStats from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-expanded-content/insights-stats';
import { Site } from '../../types';
import UpsellStatsCard from './stats/UpsellStatsCard';

type Props = {
	site: Site;
	trackEvent: ( eventName: string ) => void;
};

export function JetpackStatsPreview( { site, trackEvent }: Props ) {
	const shouldShowUpsell =
		! site?.is_atomic && ! site?.enabled_plugin_slugs?.find( ( value ) => value === 'jetpack' );

	if ( shouldShowUpsell ) {
		return (
			<>
				<UpsellStatsCard site={ site } />
			</>
		);
	}

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
		</>
	);
}
