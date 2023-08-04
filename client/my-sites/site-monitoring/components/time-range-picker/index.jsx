import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useState } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';

import './style.scss';

export function calculateTimeRange( selectedOption ) {
	const now = moment().unix();
	let start;
	let end;

	switch ( selectedOption ) {
		case '0':
			// 6 hours
			start = moment().subtract( 6, 'hours' ).unix();
			end = now;
			break;
		case '1':
			// 24 hours
			start = moment().subtract( 24, 'hours' ).unix();
			end = now;
			break;
		case '2':
			// 3 days
			start = moment().subtract( 3, 'days' ).unix();
			end = now;
			break;
		case '3':
			// 7 days
			start = moment().subtract( 7, 'days' ).unix();
			end = now;
			break;
		default:
			// Default to 24 hours in case of invalid selection
			start = moment().subtract( 24, 'hours' ).unix();
			end = now;
			break;
	}

	return { start, end };
}

export const TimeDateChartControls = ( { onTimeRangeChange } ) => {
	const translate = useTranslate();
	const [ selectedOption, setSelectedOption ] = useState( '1' ); // Default selected option is '1' (24 hours)

	// Event handler to handle changes in the SegmentedControl selection
	const handleOptionClick = ( newSelectedOption ) => {
		setSelectedOption( newSelectedOption );

		// Calculate the time range and pass it back to the parent component
		const timeRange = calculateTimeRange( newSelectedOption );
		onTimeRangeChange( timeRange );
	};

	return (
		<div className="site-monitoring-time-range-picker__container">
			<div className="site-monitoring-time-range-picker__heading">
				{ translate( 'Time range' ) }
			</div>
			<SegmentedControl primary className="site-monitoring-time-range-picker__controls">
				<SegmentedControl.Item
					value="0"
					selected={ selectedOption === '0' }
					onClick={ () => handleOptionClick( '0' ) }
				>
					{ translate( '6 hours' ) }
				</SegmentedControl.Item>
				<SegmentedControl.Item
					value="1"
					selected={ selectedOption === '1' }
					onClick={ () => handleOptionClick( '1' ) }
				>
					{ translate( '24 hours' ) }
				</SegmentedControl.Item>
				<SegmentedControl.Item
					value="2"
					selected={ selectedOption === '2' }
					onClick={ () => handleOptionClick( '2' ) }
				>
					{ translate( '3 days' ) }
				</SegmentedControl.Item>
				<SegmentedControl.Item
					value="3"
					selected={ selectedOption === '3' }
					onClick={ () => handleOptionClick( '3' ) }
				>
					{ translate( '7 days' ) }
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};
