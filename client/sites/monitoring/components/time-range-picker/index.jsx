import { SegmentedControl } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useState } from 'react';
import './style.scss';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export const TIME_RANGE_OPTIONS = {
	'6-hours': '6-hours',
	'24-hours': '24-hours',
	'3-days': '3-days',
	'7-days': '7-days',
};

export function calculateTimeRange( selectedOption ) {
	const now = moment().unix();
	let start;
	let end;

	const bits = selectedOption.split( '-' );
	if ( bits.length === 2 && [ 'days', 'hours' ].includes( bits[ 1 ] ) ) {
		start = moment().subtract( parseInt( bits[ 0 ] ), bits[ 1 ] ).unix();
		end = now;
	} else {
		// Default to 24 hours in case of invalid selection
		start = moment().subtract( 24, 'hours' ).unix();
		end = now;
	}

	return { start, end };
}

export const TimeDateChartControls = ( { onTimeRangeChange } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ selectedOption, setSelectedOption ] = useState( '24-hours' ); // Default selected option is '1' (24 hours)

	// Event handler to handle changes in the SegmentedControl selection
	const handleOptionClick = ( newSelectedOption ) => {
		dispatch(
			recordTracksEvent( 'calypso_site_monitoring_time_range_change', {
				time_range: newSelectedOption,
			} )
		);
		setSelectedOption( newSelectedOption );

		// Calculate the time range and pass it back to the parent component
		const timeRange = calculateTimeRange( newSelectedOption );
		onTimeRangeChange( timeRange );
	};

	const options = [
		{
			value: TIME_RANGE_OPTIONS[ '6-hours' ],
			label: translate( '6 hours' ),
		},
		{
			value: TIME_RANGE_OPTIONS[ '24-hours' ],
			label: translate( '24 hours' ),
		},
		{
			value: TIME_RANGE_OPTIONS[ '3-days' ],
			label: translate( '3 days' ),
		},
		{
			value: TIME_RANGE_OPTIONS[ '7-days' ],
			label: translate( '7 days' ),
		},
	];

	return (
		<div className="site-monitoring-time-range-picker__container">
			<div className="site-monitoring-time-range-picker__heading">
				{ translate( 'Time range' ) }
			</div>
			<SegmentedControl className="site-monitoring-time-range-picker__controls">
				{ options.map( ( option ) => {
					return (
						<SegmentedControl.Item
							key={ option.value }
							value={ option.value }
							selected={ selectedOption === option.value }
							onClick={ () => handleOptionClick( option.value ) }
						>
							{ option.label }
						</SegmentedControl.Item>
					);
				} ) }
			</SegmentedControl>
		</div>
	);
};
