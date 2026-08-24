import { HostingFeatures, LogType, type Site, type SiteSettings } from '@automattic/api-core';
import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { DateRangePicker, isLast7Days } from '@automattic/date-range-picker';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useDateRange } from '../../app/hooks/use-date-range';
import { useLocale } from '../../app/locale';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import TimeMismatchNotice, {
	useShouldShowTimeMismatchNotice,
} from '../../components/time-mismatch-notice';
import { hasHostingFeature, hasPlanFeature } from '../../utils/site-features';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import SiteActivityLogsDataViews from '../logs-activity/dataviews';
import { SitesNoticeArbiter } from '../notice-arbiter';
import SiteLogsDataViews from './dataviews';
import { getLogsCalloutProps } from './logs-callout';
import './style.scss';

const selectTimeZone = ( s: SiteSettings | undefined ) => ( {
	gmtOffset: Number( s?.gmt_offset ) || 0,
	timezoneString: s?.timezone_string || undefined,
} );

function SiteLogs( { logType, siteSlug }: { logType: LogType; siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	// Sites with a Jetpack connection error can't reach the settings endpoint;
	// fall back to UTC defaults so the Logs page remains accessible.
	if ( site.__inaccessible_jetpack_error ) {
		return (
			<SiteLogsContent
				site={ site }
				logType={ logType }
				gmtOffset={ 0 }
				timezoneString={ undefined }
			/>
		);
	}

	return <SiteLogsForReachableSite site={ site } logType={ logType } />;
}

function SiteLogsForReachableSite( { site, logType }: { site: Site; logType: LogType } ) {
	const { data } = useSuspenseQuery( {
		...siteSettingsQuery( site.ID ),
		select: selectTimeZone,
	} );

	return (
		<SiteLogsContent
			site={ site }
			logType={ logType }
			gmtOffset={ data.gmtOffset }
			timezoneString={ data.timezoneString }
		/>
	);
}

function SiteLogsContent( {
	site,
	logType,
	gmtOffset,
	timezoneString,
}: {
	site: Site;
	logType: LogType;
	gmtOffset: number;
	timezoneString: string | undefined;
} ) {
	const locale = useLocale();

	const settingsUrl = site.options?.admin_url
		? `${ site.options.admin_url }options-general.php`
		: '';
	const [ autoRefresh, setAutoRefresh ] = useState( false );
	const [ autoRefreshDisabledReason, setAutoRefreshDisabledReason ] = useState< string | null >(
		null
	);

	const siteId = site.ID;
	const activitySearchParams = useSearch( { strict: false } );
	const showTimeMismatchNotice = useShouldShowTimeMismatchNotice( {
		siteTime: gmtOffset,
		siteId,
	} );

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

	const { dateRange, handleDateRangeChange } = useDateRange( {
		timezoneString,
		gmtOffset,
		autoRefresh,
		defaultDays: logType === LogType.ACTIVITY ? 30 : 7,
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
					description={ createInterpolateElement(
						__( 'View and download various server logs. <learnMoreLink />' ),
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
			notices={
				<>
					{ /* Action feedback, not an on-load banner: rendered outside the arbiter. */ }
					{ autoRefreshDisabledReason && (
						<Notice variant="warning">{ autoRefreshDisabledReason }</Notice>
					) }
					<SitesNoticeArbiter>
						{ site.__inaccessible_jetpack_error && (
							<Notice variant="warning">
								{ __(
									'Your site’s time zone setting is currently unavailable. Dates and times on this page are displayed in UTC instead.'
								) }
							</Notice>
						) }
						{ showTimeMismatchNotice && (
							<TimeMismatchNotice
								settingsUrl={ settingsUrl }
								siteTime={ gmtOffset }
								siteId={ siteId }
							/>
						) }
					</SitesNoticeArbiter>
				</>
			}
		>
			<Card className={ `site-logs-card site-logs-card--${ logType }` }>
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
								searchParams={ activitySearchParams }
							/>
						</>
					) }
				</CardBody>
			</Card>
		</PageLayout>
	);
}

export default SiteLogs;
