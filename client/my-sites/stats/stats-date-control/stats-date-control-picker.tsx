import { Dropdown, Button } from '@wordpress/components';
import page from 'page';
import qs from 'qs';
import React, { useState } from 'react';
import DateControlPickerDate from './stats-date-control-picker-date';
import DateControlPickerShortcuts from './stats-date-control-picker-shortcuts';
import { DateControlPickerProps } from './types';

const DateControlPicker = ( { slug, queryParams }: DateControlPickerProps ) => {
	const redirectToQueryDate = ( daysToSubtract: number ) => {
		const startDate = calculateQueryDate( daysToSubtract );
		const query = qs.stringify( Object.assign( {}, queryParams, { startDate } ), {
			addQueryPrefix: true,
		} );
		const period = 'day'; // TODO: adjust this as needed
		const url = `/stats/${ period }/${ slug }`;
		const href = `${ url }${ query }`;

		page( href );
	};

	// shortcut list will come from props
	const shortcutList = [
		{
			id: 'today',
			label: 'Today',
			onClick: () => redirectToQueryDate( 0 ),
		},
		{
			id: 'yesterday',
			label: 'Yesterday',
			onClick: () => redirectToQueryDate( 1 ),
		},
		{
			id: 'last-7-days',
			label: 'Last 7 Days',
			onClick: () => redirectToQueryDate( 7 ),
		},
		{
			id: 'last-30-days',
			label: 'Last 30 Days',
			onClick: () => redirectToQueryDate( 30 ),
		},
		{
			id: 'last-year',
			label: 'Last Year',
			onClick: () => redirectToQueryDate( 365 ),
		},
		{
			id: 'all-time',
			label: 'All Time',
			onClick: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
			// This is empty because I don't yet fully understand what 'all time' will show
		},
		{
			id: 'custom-range',
			label: 'Custom Range',
			onClick: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
			// Keep this empty, since the custom range is handled by the DateControlPickerDate component.
		},
	];

	// calculate the date to query for based on the number of days to subtract
	function calculateQueryDate( daysToSubtract: number ) {
		const today = new Date();
		const date = new Date( today );
		date.setDate( date.getDate() - daysToSubtract );
		return date.toISOString().split( 'T' )[ 0 ];
	}

	// TODO: remove placeholder values
	const [ inputStartDate, setInputStartDate ] = useState( new Date().toISOString().slice( 0, 10 ) );
	const [ inputEndDate, setInputEndDate ] = useState(
		new Date( new Date().setMonth( new Date().getMonth() - 3 ) ).toISOString().slice( 0, 10 )
	);

	const changeStartDate = ( value: string ) => {
		// do more here
		setInputStartDate( value );
	};

	const changeEndDate = ( value: string ) => {
		// do more here
		setInputEndDate( value );
	};

	const handleOnApply = () => {
		const nextDay = inputStartDate;
		const nextDayQuery = qs.stringify( Object.assign( {}, queryParams, { startDate: nextDay } ), {
			addQueryPrefix: true,
		} );
		const period = 'day'; // TODO: make this dynamic
		const url = `/stats/${ period }/${ slug }`;
		const href = `${ url }${ nextDayQuery }`;

		page( href );
	};

	const DateControlPickerContent = () => (
		<div>
			<DateControlPickerDate
				startDate={ inputStartDate }
				endDate={ inputEndDate }
				onStartChange={ changeStartDate }
				onEndChange={ changeEndDate }
				onApply={ handleOnApply }
			/>
			<DateControlPickerShortcuts shortcutList={ shortcutList } />
		</div>
	);

	return (
		<Dropdown
			// TODO: add CSS to increase the width
			popoverProps={ { placement: 'bottom-end' } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button variant="primary" onClick={ onToggle } aria-expanded={ isOpen }>
					{ `${ inputStartDate } - ${ inputEndDate }` }
				</Button>
			) }
			renderContent={ () => <DateControlPickerContent /> }
		/>
	);
};

export default DateControlPicker;
