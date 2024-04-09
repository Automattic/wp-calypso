import { Button } from '@automattic/components';
import { external, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import SitePreviewPaneContent from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/site-preview-pane-content';
import DocumentHead from 'calypso/components/data/document-head';
import BoostSitePerformance from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-expanded-content/boost-site-performance';
import InsightsStats from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-expanded-content/insights-stats';
import MonitorActivity from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-expanded-content/monitor-activity';
import { Site } from '../../types';
import HostingSummary from '../hosting/summary';

type Props = {
	site: Site;
	trackEvent: ( eventName: string ) => void;
	hasError?: boolean;
};

export function JetpackOverviewTab( { site, trackEvent, hasError = false }: Props ) {
	const translate = useTranslate();
	return (
		<>
			<DocumentHead title={ translate( 'Overview' ) } />
			<SitePreviewPaneContent className="site-preview-pane__overview-content">
				<div className="site-preview-pane__monitor-content">
					<MonitorActivity
						hasMonitor={ site.monitor_settings.monitor_active }
						site={ site }
						trackEvent={ trackEvent }
						hasError={ hasError }
					/>
				</div>
				<div className="site-preview-pane__stats-content">
					<InsightsStats
						stats={ site.site_stats }
						siteUrlWithScheme={ site.url_with_scheme }
						trackEvent={ trackEvent }
					/>
				</div>
				<div className="site-preview-pane__boost-content">
					<BoostSitePerformance site={ site } trackEvent={ trackEvent } hasError={ hasError } />
				</div>
				<HostingSummary />
				<div className="site-preview-pane__plugins-content">
					<h3>{ translate( 'Plugins' ) }</h3>
					<p className="site-preview-pane__plugins-caption">
						{ translate(
							"Note: We are currently working to make this section function from the Automattic for Agencies dashboard. In the meantime, you'll be taken to WP-Admin."
						) }
					</p>
					<div style={ { marginTop: '24px' } }>
						<Button href={ site.url_with_scheme + '/wp-admin/plugins.php' } primary target="_blank">
							{ translate( 'Manage Plugins in wp-admin' ) }
							<Icon
								icon={ external }
								size={ 16 }
								className="site-preview-pane__plugins-icon"
								viewBox="0 0 20 20"
							/>
						</Button>
					</div>
				</div>
			</SitePreviewPaneContent>
		</>
	);
}
