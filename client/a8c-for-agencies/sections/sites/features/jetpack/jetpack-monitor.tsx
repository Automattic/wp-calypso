import DocumentHead from 'calypso/components/data/document-head';
import MonitorActivity from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-expanded-content/monitor-activity';
import { Site } from '../../types';

type Props = {
	site: Site;
	trackEvent: ( eventName: string ) => void;
	hasError?: boolean;
};

export function JetpackMonitorPreview( { site, trackEvent, hasError = false }: Props ) {
	return (
		<>
			<DocumentHead title="Monitor" />
			<div className="site-preview-pane__monitor-content">
				<MonitorActivity
					hasMonitor={ site.monitor_settings.monitor_active }
					site={ site }
					trackEvent={ trackEvent }
					hasError={ hasError }
				/>
			</div>
		</>
	);
}
