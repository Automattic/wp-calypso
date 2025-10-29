import { HostingFeatures, LogType } from '@automattic/api-core';
import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalVStack as VStack, TabPanel } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useDateRange } from '../../app/hooks/use-date-range';
import { useLocale } from '../../app/locale';
import { siteRoute } from '../../app/router/sites';
import { Card, CardBody, CardHeader } from '../../components/card';
import { DateRangePicker } from '../../components/date-range-picker';
import { isLast7Days } from '../../components/date-range-picker/utils';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { hasHostingFeature, hasPlanFeature } from '../../utils/site-features';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
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
	const [ autoRefreshDisabledReason, setAutoRefreshDisabledReason ] = useState< string | null >(
		null
	);

	const siteId = site.ID;

	// Normalize any incoming ?from/&to query params to Unix seconds (canonical form)
	useEffect( () => {
		try {
			const url = new URL( window.location.href );
			const searchParams = url.searchParams;
			let changed = false;
			let sawParam = false;
			( [ 'from', 'to' ] as const ).forEach( ( key ) => {
				const raw = searchParams.get( key );
				if ( ! raw ) {
					return;
				}
				sawParam = true;
				const number = Number.parseInt( raw, 10 );
				if ( ! Number.isFinite( number ) ) {
					return;
				}
				if ( number > 1e12 ) {
					searchParams.set( key, String( Math.floor( number / 1000 ) ) );
					changed = true;
				}
			} );

			// Only rewrite if we saw a param and actually changed it; preserve hash
			if ( sawParam && changed ) {
				history.replaceState( null, '', url.toString() );
			}
		} catch ( _e ) {
			// noop: if URL is not parseable, skip normalization
		}
	}, [] );

	const { data } = useSuspenseQuery( {
		...siteSettingsQuery( siteId ),
		select: ( s ) => ( {
			gmtOffset: Number( s?.gmt_offset ) || 0,
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
		if ( autoRefresh && ! isLast7Days( next, timezoneString, gmtOffset ) ) {
			setAutoRefresh( false );
			setAutoRefreshDisabledReason( __( 'Auto-refresh only works with "Last 7 days" preset' ) );
		} else {
			// Clear on any other change, including non–last-7 → non–last-7
			setAutoRefreshDisabledReason( null );
		}

		handleDateRangeChange( next );

		setDateRangeVersion( ( v ) => v + 1 );
	};

	const handleAutoRefreshToggle = ( isChecked: boolean ) => {
		if ( isChecked && ! isLast7Days( dateRange, timezoneString, gmtOffset ) ) {
			setAutoRefreshDisabledReason( __( 'Auto-refresh only works with "Last 7 days" preset' ) );
			return false;
		}
		setAutoRefresh( isChecked );
		setAutoRefreshDisabledReason( null );
		return true;
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
	// hide the datepicker if the user doesn't have access to activity logs or doesn't have logging feature at all
	const shouldShowDateRangePicker =
		hasHostingFeature( site, HostingFeatures.LOGS ) ||
		( hasActivityLogAccess && logType === LogType.ACTIVITY ); // simple sites might have access to activity logs only
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Logs' ) }
					description={ createInterpolateElement(
						__(
							'View and download various server logs. <learnMoreLink>Learn more</learnMoreLink>'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="site-monitoring-logs" />,
						}
					) }
					actions={
						shouldShowDateRangePicker ? (
							<DateRangePicker
								start={ dateRange.start }
								end={ dateRange.end }
								gmtOffset={ gmtOffset }
								timezoneString={ timezoneString }
								locale={ locale }
								onChange={ handleDateRangeChangeWrapper }
							/>
						) : undefined
					}
				/>
			}
		>
			<VStack as="div" spacing={ 3 }>
				{ autoRefreshDisabledReason && (
					<Notice variant="warning">{ autoRefreshDisabledReason }</Notice>
				) }
				<Card className={ `site-logs-card site-logs-card--${ logType }` }>
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
							<HostingFeatureGatedWithCallout site={ site } { ...getLogsCalloutProps() }>
								<SiteLogsDataViews
									logType={ logType }
									dateRange={ dateRange }
									dateRangeVersion={ dateRangeVersion }
									autoRefresh={ autoRefresh }
									setAutoRefresh={ setAutoRefresh }
									autoRefreshDisabledReason={ autoRefreshDisabledReason }
									onAutoRefreshRequest={ handleAutoRefreshToggle }
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
							</>
						) }
					</CardBody>
				</Card>
			</VStack>
		</PageLayout>
	);
}

export default SiteLogs;
