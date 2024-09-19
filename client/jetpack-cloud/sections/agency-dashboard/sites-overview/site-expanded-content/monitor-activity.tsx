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
import type { Site } from '../types';

interface Props {
	hasMonitor: boolean;
	site: Site;
	trackEvent: ( eventName: string ) => void;
	hasError: boolean;
}

const START_INDEX = 10;

const MonitorDataContent = ( { siteId }: { siteId: number } ) => {
	const translate = useTranslate();
	const getMonitorDowntimeText = useGetMonitorDowntimeText();

	const { data } = useFetchMonitorData( siteId, '30 days' );

	const incidents = data ?? [];

	// We need to slice the data because the API returns the latest 30 incidents
	const monitorData = incidents.slice( START_INDEX ).map( ( data ) => {
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
				<div className="site-expanded-content__chart">
					{ monitorData.length > 0 ? (
						<ElementChart
							data={ monitorData }
							minBarWidth={ 10 }
							sliceFromBeginning={ false }
							minBarsToBeShown={ 20 }
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
			</div>
		</div>
	);
};

export default function MonitorActivity( { hasMonitor, site, trackEvent, hasError }: Props ) {
	const translate = useTranslate();

	const toggleActivateMonitor = useToggleActivateMonitor( [ site ] );
	const statuses = useSelector( getSiteMonitorStatuses );
	const isLoading = statuses?.[ site.blog_id ] === 'loading';

	const handleOnClick = () => {
		trackEvent( 'expandable_block_activate_monitor_click' );
		toggleActivateMonitor( true );
	};

	return (
		<ExpandedCard
			header={ translate( 'Monitor activity' ) }
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
			{ hasMonitor && <MonitorDataContent siteId={ site.blog_id } /> }
		</ExpandedCard>
	);
}
