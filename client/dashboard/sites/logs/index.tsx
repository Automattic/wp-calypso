import { HostingFeatures, LogType } from '@automattic/api-core';
import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { TabPanel, Card, CardHeader, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getUnixTime } from 'date-fns';
import { useState } from 'react';
import { useLocale } from '../../app/locale';
import { siteRoute } from '../../app/router/sites';
import { DateRangePicker } from '../../components/date-range-picker';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import SiteActivityLogsDataView from '../logs-activity';
import SiteLogsDataView from './components/dataview';
import { getLogsCalloutProps } from './logs-callout';
import { getInitialDateRangeFromSearch, getDefaultDateRange, LOG_TABS } from './utils';

import './style.scss';

function SiteLogs( { logType }: { logType: LogType } ) {
	const locale = useLocale();
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();
	const search = router.state.location.search;

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const siteId = site.ID;

	const { data } = useSuspenseQuery( {
		...siteSettingsQuery( siteId ),
		select: ( s ) => ( {
			gmtOffset: typeof s?.gmt_offset === 'number' ? s.gmt_offset : 0,
			timezoneString: s?.timezone_string || undefined,
		} ),
	} );

	const { gmtOffset, timezoneString } = data!;

	const initial = getDefaultDateRange( timezoneString, gmtOffset );

	const initialFromUrl = getInitialDateRangeFromSearch( search );

	const [ dateRange, setDateRange ] = useState< { start: Date; end: Date } >(
		() => initialFromUrl ?? initial
	);
	// this is used to track changes across the dateRange to ensure the components can react to changes when they are triggered by a change in the DateRangePicker
	const [ dateRangeVersion, setDateRangeVersion ] = useState( 0 );

	const handleDateRangeChange = ( next: { start: Date; end: Date } ) => {
		setDateRange( next );
		setDateRangeVersion( ( v ) => v + 1 );

		// Sync from/to to the URL as UNIX seconds
		const url = new URL( window.location.href );
		url.searchParams.set( 'from', String( getUnixTime( next.start ) ) );
		url.searchParams.set( 'to', String( getUnixTime( next.end ) ) );
		window.history.replaceState( null, '', url.pathname + url.search );
	};

	const handleTabChange = ( tab: LogType ) => {
		if ( tab === LogType.PHP ) {
			router.navigate( { to: `/sites/${ siteSlug }/logs/php` } );
		} else if ( tab === LogType.ACTIVITY ) {
			router.navigate( { to: `/sites/${ siteSlug }/logs/activity` } );
		} else {
			router.navigate( { to: `/sites/${ siteSlug }/logs/server` } );
		}
	};

	return (
		<PageLayout header={ <PageHeader title={ __( 'Logs' ) } /> }>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.LOGS }
				asOverlay
				{ ...getLogsCalloutProps() }
			>
				<>
					{ logType !== LogType.ACTIVITY && (
						<DateRangePicker
							start={ dateRange.start }
							end={ dateRange.end }
							gmtOffset={ gmtOffset }
							timezoneString={ timezoneString }
							locale={ locale }
							onChange={ handleDateRangeChange }
						/>
					) }
					<Card className="site-logs-card">
						<CardHeader style={ { paddingBottom: '0' } }>
							<TabPanel
								className="site-logs-tabs"
								activeClass="is-active"
								tabs={ LOG_TABS }
								onSelect={ ( tabName ) => {
									if (
										tabName === LogType.PHP ||
										tabName === LogType.SERVER ||
										tabName === LogType.ACTIVITY
									) {
										handleTabChange( tabName );
									}
								} }
								initialTabName={ logType }
							>
								{ () => null }
							</TabPanel>
						</CardHeader>
						<CardBody>
							{ logType === LogType.PHP || logType === LogType.SERVER ? (
								<SiteLogsDataView
									logType={ logType }
									dateRange={ dateRange }
									dateRangeVersion={ dateRangeVersion }
									setDateRange={ setDateRange }
									gmtOffset={ gmtOffset }
									timezoneString={ timezoneString }
									site={ site }
								/>
							) : (
								<SiteActivityLogsDataView
									logType={ logType }
									dateRange={ dateRange }
									dateRangeVersion={ dateRangeVersion }
									setDateRange={ setDateRange }
									gmtOffset={ gmtOffset }
									timezoneString={ timezoneString }
									site={ site }
								/>
							) }
						</CardBody>
					</Card>
				</>
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}

export default SiteLogs;
