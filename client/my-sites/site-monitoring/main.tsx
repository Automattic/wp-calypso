import { translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { SiteMonitoringTabPanel } from './components/site-monitoring-tab-panel';
import { LogsTab } from './logs-tab';
import { MetricsTab } from './metrics-tab';
import { SiteMonitoringTab } from './site-monitoring-filter-params';

import './style.scss';

interface SiteMetricsProps {
	tab: SiteMonitoringTab;
}

export function SiteMetrics( { tab = 'metrics' }: SiteMetricsProps ) {
	const titleHeader = translate( 'Monitoring' );

	return (
		<Main className="site-monitoring" fullWidthLayout>
			<PageViewTracker path="/site-monitoring/:site" title="Site Monitoring" />
			<DocumentHead title={ titleHeader } />
			<FormattedHeader
				className="site-monitoring__formatted-header modernized-header"
				align="left"
				headerText={ titleHeader }
				subHeaderText={ translate(
					'Real time information to troubleshoot or debug problems with your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: (
								<InlineSupportLink
									key="learnMore"
									supportContext="site-monitoring"
									showIcon={ false }
								/>
							),
						},
					}
				) }
			></FormattedHeader>
			<SiteMonitoringTabPanel selectedTab={ tab }></SiteMonitoringTabPanel>
			<div>
				{ tab === 'metrics' && <MetricsTab /> }
				{ tab !== 'metrics' && <LogsTab logType={ tab } /> }
			</div>
		</Main>
	);
}
