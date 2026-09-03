import { HostingFeatures, LogType } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { DateRangePicker } from '@automattic/date-range-picker';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useDateRange } from '../../../app/hooks/use-date-range';
import { useSiteTimezoneWithJetpackFallback } from '../../../app/hooks/use-site-timezone';
import { useLocale } from '../../../app/locale';
import { agencySiteActivityRoute, agencySiteRoute } from '../../../app/router/agency';
import { Card, CardBody } from '../../../components/card';
import InlineSupportLink from '../../../components/inline-support-link';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import SiteActivityLogsDataViews from '../../../sites/logs-activity/dataviews';
import { hasHostingFeature, hasPlanFeature } from '../../../utils/site-features';

export default function AgencySiteActivity() {
	const { siteSlug } = agencySiteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { gmtOffset, timezoneString } = useSiteTimezoneWithJetpackFallback( site );

	const locale = useLocale();
	const searchParams = agencySiteActivityRoute.useSearch();

	// Activity has no auto-refresh, but the shared DataViews props require this state.
	const [ autoRefresh, setAutoRefresh ] = useState( false );
	const { dateRange, handleDateRangeChange } = useDateRange( {
		timezoneString,
		gmtOffset,
		autoRefresh,
	} );
	const [ dateRangeVersion, setDateRangeVersion ] = useState( 0 );

	const handleDateRangeChangeWrapper = ( next: { start: Date; end: Date } ) => {
		handleDateRangeChange( next );
		setDateRangeVersion( ( v ) => v + 1 );
	};

	const hasActivityLogAccess =
		hasHostingFeature( site, HostingFeatures.ACTIVITY_LOG ) ||
		hasPlanFeature( site, HostingFeatures.ACTIVITY_LOG );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Activity' ) }
					description={ createInterpolateElement(
						__( 'View your site’s activity log. <learnMoreLink />' ),
						{
							learnMoreLink: <InlineSupportLink supportContext="site-monitoring-logs" />,
						}
					) }
					actions={
						<DateRangePicker
							start={ dateRange.start }
							end={ dateRange.end }
							gmtOffset={ gmtOffset }
							timezoneString={ timezoneString }
							locale={ locale }
							onChange={ handleDateRangeChangeWrapper }
						/>
					}
				/>
			}
		>
			<Card className="site-logs-card site-logs-card--activity">
				<CardBody>
					{ /* TODO(A4A-2917): the reused activity DataViews shows a primary "Manage backup"
					     row action on rewindable entries that navigates to the dotcom
					     siteBackupDetailRoute, which A4A doesn't register — it dead-ends until
					     agency backups routes exist. Hide or re-point it once backups land. */ }
					<SiteActivityLogsDataViews
						logType={ LogType.ACTIVITY }
						dateRange={ dateRange }
						dateRangeVersion={ dateRangeVersion }
						autoRefresh={ autoRefresh }
						setAutoRefresh={ setAutoRefresh }
						gmtOffset={ gmtOffset }
						timezoneString={ timezoneString }
						site={ site }
						hasActivityLogsAccess={ hasActivityLogAccess }
						searchParams={ searchParams }
					/>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
