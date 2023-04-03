import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import ElementChart from 'calypso/components/chart';
import useFetchMonitorData from 'calypso/data/agency-dashboard/use-fetch-monitor-data';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { getMonitorDowntimeText } from '../utils';
import ExpandedCard from './expanded-card';
import type { ReactChild } from 'react';

interface Props {
	hasMonitor: boolean;
	siteId: number;
}

const START_INDEX = 10;

const MonitorDataContent = ( { siteId }: { siteId: number } ) => {
	const translate = useTranslate();

	const { data, isLoading } = useFetchMonitorData( siteId, '30 days' );

	const incidents = data ?? [];

	// We need to slice the data because the API returns the latest 30 incidents
	const monitorData = incidents.slice( START_INDEX ).map( ( data ) => {
		const { date, status, downtime_in_minutes } = data;

		let className = 'site-expanded-content__chart-bar-no-data';
		let tooltipLabel: ReactChild = 'No data';

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
		<>
			<div className="site-expanded-content__card-content">
				<div className="site-expanded-content__card-content-column">
					<div className="site-expanded-content__chart">
						{ isLoading ? (
							<TextPlaceholder />
						) : (
							<ElementChart
								data={ monitorData }
								minBarWidth={ 10 }
								sliceFromBeginning={ false }
								minBarsToBeShown={ 20 }
								hideYAxis={ true }
								hideXAxis={ true }
							/>
						) }
					</div>
					<div className="site-expanded-content__x-axis-pointers">
						<span>{ translate( '20d ago' ) }</span>
						<span>{ translate( 'Today' ) }</span>
					</div>
				</div>
			</div>
			<div className="site-expanded-content__card-footer">
				<Button className="site-expanded-content__card-button" compact>
					{ translate( 'All activity' ) }
				</Button>
			</div>
		</>
	);
};

export default function MonitorActivity( { hasMonitor, siteId }: Props ) {
	const translate = useTranslate();

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
		>
			{ hasMonitor && <MonitorDataContent siteId={ siteId } /> }
		</ExpandedCard>
	);
}
