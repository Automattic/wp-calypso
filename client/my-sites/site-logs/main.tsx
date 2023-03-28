import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import { SiteLogsTab, useSiteLogsQuery } from 'calypso/data/hosting/use-site-logs-query';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SiteLogsTabPanel } from './components/site-logs-tab-panel';
import { SiteLogsTable } from './components/site-logs-table';
import { SiteLogsToolbar } from './components/site-logs-toolbar';

export function SiteLogs() {
	const { __ } = useI18n();
	const siteId = useSelector( getSelectedSiteId );
	const moment = useLocalizedMoment();

	const getDateRange = () => {
		const startTime = moment().subtract( 7, 'd' ).unix();
		const endTime = moment().unix();
		return { startTime, endTime };
	};

	const [ dateRange, setDateRange ] = useState( getDateRange() );

	const [ logType, setLogType ] = useState< SiteLogsTab >( () => {
		const queryParam = new URL( window.location.href ).searchParams.get( 'log-type' );
		return (
			queryParam && [ 'php', 'web' ].includes( queryParam ) ? queryParam : 'php'
		) as SiteLogsTab;
	} );

	const { data } = useSiteLogsQuery( siteId, {
		logType,
		start: dateRange.startTime,
		end: dateRange.endTime,
		sort_order: 'desc',
		page_size: 10,
	} );

	const handleTabSelected = ( tabName: SiteLogsTab ) => {
		setLogType( tabName );
	};

	const handleRefresh = () => {
		setDateRange( getDateRange() );
	};

	const titleHeader = __( 'Site Logs' );

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ titleHeader } />
			<FormattedHeader
				brandFont
				headerText={ titleHeader }
				subHeaderText={ __( 'View server logs to troubleshoot or debug problems with your site.' ) }
				align="left"
			/>

			<SiteLogsTabPanel selectedTab={ logType } onSelected={ handleTabSelected }>
				{ () => (
					<>
						<SiteLogsToolbar onRefresh={ handleRefresh } />
						<SiteLogsTable logs={ data?.logs } />
					</>
				) }
			</SiteLogsTabPanel>
		</Main>
	);
}
