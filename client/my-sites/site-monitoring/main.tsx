import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { SiteMonitoringTabPanel } from './components/site-monitoring-tab-panel';
import { LogsTab } from './logs-tab';
import { MetricsTab } from './metrics-tab';
import { SiteMonitoringTab, getPageQueryParam } from './site-monitoring-filter-params';

import './style.scss';

export function SiteMetrics() {
	const { __ } = useI18n();
	const titleHeader = __( 'Site Monitoring' );
	const [ page, setPage ] = useState< SiteMonitoringTab >( () => getPageQueryParam() || 'metrics' );

	const handleTabSelected = ( tabName: SiteMonitoringTab ) => {
		setPage( tabName );
	};

	return (
		<Main className="site-monitoring" fullWidthLayout>
			<DocumentHead title={ titleHeader } />
			<FormattedHeader
				brandFont
				headerText={ titleHeader }
				subHeaderText={ __(
					'Real time information to troubleshoot or debug problems with your site.'
				) }
				align="left"
				className="site-monitoring__formatted-header"
			></FormattedHeader>
			<SiteMonitoringTabPanel selectedTab={ page } onSelected={ handleTabSelected }>
				{ () => (
					<>
						{ page === 'metrics' && <MetricsTab /> }
						{ page !== 'metrics' && <LogsTab logType={ page } /> }
					</>
				) }
			</SiteMonitoringTabPanel>
		</Main>
	);
}
