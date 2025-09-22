import { HostingFeatures, LogType } from '@automattic/api-core';
import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	Card,
	CardBody,
	CardHeader,
	__experimentalHStack as HStack,
	TabPanel,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useDateRange } from '../../app/hooks/use-date-range';
import { useLocale } from '../../app/locale';
import { siteRoute } from '../../app/router/sites';
import { DateRangePicker } from '../../components/date-range-picker';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { hasHostingFeature, hasPlanFeature } from '../../utils/site-features';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { ActivityLogsCallout } from '../logs-activity/activity-logs-callout';
import SiteActivityLogsDataViews from '../logs-activity/dataviews';
import SiteLogsDataViews from './dataviews';
import { getLogsCalloutProps } from './logs-callout';
import { LOG_TABS } from './utils';

import './style.scss';

function SiteLogs( { logType }: { logType: LogType } ) {
	const locale = useLocale();
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const [ autoRefresh, setAutoRefresh ] = useState( false );

	const siteId = site.ID;

	const { data } = useSuspenseQuery( {
		...siteSettingsQuery( siteId ),
		select: ( s ) => ( {
			gmtOffset: typeof s?.gmt_offset === 'number' ? s.gmt_offset : 0,
			timezoneString: s?.timezone_string || undefined,
		} ),
	} );

	const { gmtOffset, timezoneString } = data!;

	const { dateRange, handleDateRangeChange } = useDateRange( {
		timezoneString,
		gmtOffset,
		autoRefresh,
	} );
	// this is used to track changes across the dateRange to ensure the components can react to changes when they are triggered by a change in the DateRangePicker
	const [ dateRangeVersion, setDateRangeVersion ] = useState( 0 );

	const handleDateRangeChangeWrapper = ( next: { start: Date; end: Date } ) => {
		setAutoRefresh( false );
		handleDateRangeChange( next );

		setDateRangeVersion( ( v ) => v + 1 );
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
	const hasActivityLogAccess =
		hasHostingFeature( site, HostingFeatures.ACTIVITY_LOG ) ||
		hasPlanFeature( site, HostingFeatures.ACTIVITY_LOG );
	return (
		<PageLayout header={ <PageHeader title={ __( 'Logs' ) } /> }>
			<>
				{ logType !== LogType.ACTIVITY && (
					<DateRangePicker
						start={ dateRange.start }
						end={ dateRange.end }
						gmtOffset={ gmtOffset }
						timezoneString={ timezoneString }
						locale={ locale }
						onChange={ handleDateRangeChangeWrapper }
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
						<div className={ `site-logs__${ logType }` }>
							{ logType === LogType.PHP || logType === LogType.SERVER ? (
								<HostingFeatureGatedWithCallout
									site={ site }
									feature={ HostingFeatures.LOGS }
									{ ...getLogsCalloutProps() }
								>
									<SiteLogsDataViews
										logType={ logType }
										dateRange={ dateRange }
										dateRangeVersion={ dateRangeVersion }
										autoRefresh={ autoRefresh }
										setAutoRefresh={ setAutoRefresh }
										gmtOffset={ gmtOffset }
										timezoneString={ timezoneString }
										site={ site }
									/>
								</HostingFeatureGatedWithCallout>
							) : (
								<>
									<SiteActivityLogsDataViews
										logType={ logType }
										dateRange={ dateRange }
										dateRangeVersion={ dateRangeVersion }
										autoRefresh={ autoRefresh }
										setAutoRefresh={ setAutoRefresh }
										gmtOffset={ gmtOffset }
										timezoneString={ timezoneString }
										site={ site }
										hasActivityLogsAccess={ hasActivityLogAccess }
									/>
									{ ! hasActivityLogAccess && (
										<HStack alignment="center" expanded className="site-logs__activity-callout">
											<div className="site-logs__activity-callout-content">
												<ActivityLogsCallout siteSlug={ site.slug } />
											</div>
										</HStack>
									) }
								</>
							) }
						</div>
					</CardBody>
				</Card>
			</>
		</PageLayout>
	);
}

export default SiteLogs;
