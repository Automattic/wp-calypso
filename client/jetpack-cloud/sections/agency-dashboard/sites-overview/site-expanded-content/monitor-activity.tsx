import { formatNumber } from '@automattic/number-formatters';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import ElementChart from 'calypso/components/chart';
import useFetchMonitorData from 'calypso/data/agency-dashboard/use-fetch-monitor-data';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { useSelector } from 'calypso/state';
import { getSiteMonitorStatuses } from 'calypso/state/jetpack-agency-dashboard/selectors';
import useToggleActivateMonitor from '../../hooks/use-toggle-activate-monitor';
import ExpandedCard from './expanded-card';
import useGetMonitorDowntimeText from './hooks/use-get-monitor-downtime-text';
import {
	formatDowntimeDuration,
	getMonitorActivitySummary,
	type MonitorActivityDay,
} from './monitor-activity-summary';
import type { Site } from '../types';
import type { ReactNode } from 'react';

interface Props {
	hasMonitor: boolean;
	site: Site;
	trackEvent: ( eventName: string ) => void;
	hasError: boolean;
	// Opt-in summary stats, status pill and legend around the activity bar.
	showSummary?: boolean;
}

const START_INDEX = 10;
const DAYS_SHOWN = 20;

// monitor_site_status is false by default, so a site that has never changed status is up.
const INITIAL_UNIX_EPOCH = '1970-01-01 00:00:00';

const isSiteUp = ( site: Site ) =>
	site.monitor_settings.monitor_site_status ||
	INITIAL_UNIX_EPOCH === site.monitor_last_status_change;

const MonitorSummary = ( { days, site }: { days: MonitorActivityDay[]; site: Site } ) => {
	const translate = useTranslate();

	const { monitoredDays, downtimeEvents, downtimeInMinutes, uptimeFraction } =
		getMonitorActivitySummary( days );

	const stats: { key: string; value: string; label: ReactNode }[] = [];

	if ( uptimeFraction !== null ) {
		// Truncate rather than round so a site with recorded downtime never reads as 100%.
		const truncatedUptime = Math.floor( uptimeFraction * 1000 ) / 1000;
		const fractionDigits = truncatedUptime === 1 ? 0 : 1;

		stats.push( {
			key: 'uptime',
			value: formatNumber( truncatedUptime, {
				numberFormatOptions: {
					style: 'percent',
					minimumFractionDigits: fractionDigits,
					maximumFractionDigits: fractionDigits,
				},
			} ),
			label: translate( 'Uptime' ),
		} );
	}

	if ( monitoredDays > 0 ) {
		stats.push( {
			key: 'downtime-events',
			value: formatNumber( downtimeEvents ),
			label: translate( 'Downtime event', 'Downtime events', { count: downtimeEvents } ),
		} );
	}

	if ( downtimeInMinutes !== null ) {
		stats.push( {
			key: 'total-downtime',
			value: formatDowntimeDuration( downtimeInMinutes ),
			label: translate( 'Total downtime' ),
		} );
	}

	const siteIsUp = isSiteUp( site );

	return (
		<div className="site-expanded-content__monitor-summary">
			<div className="site-expanded-content__monitor-stats">
				{ stats.map( ( { key, value, label } ) => (
					<div className="site-expanded-content__monitor-stat" key={ key }>
						<span className="site-expanded-content__monitor-stat-value">{ value }</span>
						<span className="site-expanded-content__monitor-stat-label">{ label }</span>
					</div>
				) ) }
			</div>
			<div
				className={ clsx(
					'site-expanded-content__monitor-status',
					siteIsUp
						? 'site-expanded-content__monitor-status-is-up'
						: 'site-expanded-content__monitor-status-is-down'
				) }
			>
				<span className="site-expanded-content__monitor-status-dot" aria-hidden="true" />
				{ siteIsUp ? translate( 'Site is up' ) : translate( 'Site is down' ) }
			</div>
		</div>
	);
};

const MonitorLegend = () => {
	const translate = useTranslate();

	const items = [
		{ key: 'up', modifier: 'is-uptime', label: translate( 'Up' ) },
		{ key: 'down', modifier: 'is-downtime', label: translate( 'Downtime' ) },
		{ key: 'no-data', modifier: 'is-not-monitored', label: translate( 'Not monitored' ) },
	];

	return (
		<div className="site-expanded-content__monitor-legend">
			{ items.map( ( { key, modifier, label } ) => (
				<span className="site-expanded-content__monitor-legend-item" key={ key }>
					<span
						className={ clsx( 'site-expanded-content__monitor-legend-swatch', modifier ) }
						aria-hidden="true"
					/>
					{ label }
				</span>
			) ) }
		</div>
	);
};

const MonitorDataContent = ( { site, showSummary }: { site: Site; showSummary: boolean } ) => {
	const translate = useTranslate();
	const getMonitorDowntimeText = useGetMonitorDowntimeText();

	const { data } = useFetchMonitorData( site.blog_id, '30 days' );

	const incidents = data ?? [];

	// We need to slice the data because the API returns the latest 30 incidents
	const days: MonitorActivityDay[] = incidents.slice( START_INDEX );

	const monitorData = days.map( ( data ) => {
		const { date, status, downtime_in_minutes } = data;

		let className = 'site-expanded-content__chart-bar-no-data';
		let tooltipLabel = 'No data';

		if ( status === 'up' ) {
			className = 'site-expanded-content__chart-bar-is-uptime';
			tooltipLabel = translate( '100% uptime' );
		} else if ( status === 'down' ) {
			className = 'site-expanded-content__chart-bar-is-downtime';
			tooltipLabel = getMonitorDowntimeText( downtime_in_minutes );
		}

		return {
			label: moment( date ).format,
			value: 1, // we always show full bar, so value is always 1
			className,
			tooltipData: [
				{
					label: moment( date ).format( 'MMM D, YYYY' ),
				},
				{
					label: tooltipLabel,
				},
			],
		};
	} );

	return (
		<div className="site-expanded-content__card-content">
			<div className="site-expanded-content__card-content-column">
				{ showSummary && <MonitorSummary days={ days } site={ site } /> }
				<div className="site-expanded-content__chart">
					{ monitorData.length > 0 ? (
						<ElementChart
							data={ monitorData }
							minBarWidth={ 10 }
							sliceFromBeginning={ false }
							minBarsToBeShown={ DAYS_SHOWN }
							hideYAxis
							hideXAxis
						/>
					) : (
						<TextPlaceholder />
					) }
				</div>
				<div className="site-expanded-content__x-axis-pointers">
					<span>{ translate( '20d ago' ) }</span>
					<span>{ translate( 'Today' ) }</span>
				</div>
				{ showSummary && <MonitorLegend /> }
			</div>
		</div>
	);
};

export default function MonitorActivity( {
	hasMonitor,
	site,
	trackEvent,
	hasError,
	showSummary = false,
}: Props ) {
	const translate = useTranslate();

	const toggleActivateMonitor = useToggleActivateMonitor( [ site ] );
	const statuses = useSelector( getSiteMonitorStatuses );
	const isLoading = statuses?.[ site.blog_id ] === 'loading';

	const handleOnClick = () => {
		trackEvent( 'expandable_block_activate_monitor_click' );
		toggleActivateMonitor( true );
	};

	const title = translate( 'Monitor activity' );

	return (
		<ExpandedCard
			className={ clsx( { 'site-expanded-content__monitor-activity-detailed': showSummary } ) }
			header={
				showSummary ? (
					<>
						<span>{ title }</span>
						<span className="site-expanded-content__monitor-range">
							{ translate( 'Last %(days)d days', { args: { days: DAYS_SHOWN } } ) }
						</span>
					</>
				) : (
					title
				)
			}
			isEnabled={ hasMonitor }
			emptyContent={ translate(
				'Activate {{strong}}Monitor{{/strong}} to see your uptime records',
				{
					components: {
						strong: <strong></strong>,
					},
				}
			) }
			isLoading={ isLoading }
			hasError={ hasError }
			// Allow to click on the card only if the monitor is not active & the site is not atomic
			onClick={ ! hasMonitor ? handleOnClick : undefined }
		>
			{ hasMonitor && <MonitorDataContent site={ site } showSummary={ showSummary } /> }
		</ExpandedCard>
	);
}
