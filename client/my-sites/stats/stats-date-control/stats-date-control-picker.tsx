import { Dropdown, Button } from '@wordpress/components';
import page from 'page';
import qs from 'qs';
import React, { useState } from 'react';
import DateControlPickerDate from './stats-date-control-picker-date';
import DateControlPickerShortcuts from './stats-date-control-picker-shortcuts';
import { DateControlPickerProps, DateControlPickerShortcut } from './types';

const DateControlPicker = ( { slug, queryParams }: DateControlPickerProps ) => {
	// shortcut list will come from props
	const shortcutList = [
		{
			id: 'today',
			label: 'Today',
			offset: 0,
			range: 0,
		},
		{
			id: 'yesterday',
			label: 'Yesterday',
			offset: 1,
			range: 0,
		},
		{
			id: 'last-7-days',
			label: 'Last 7 Days',
			offset: 0,
			range: 7,
		},
		{
			id: 'last-30-days',
			label: 'Last 30 Days',
			offset: 0,
			range: 30,
		},
		{
			id: 'last-year',
			label: 'Last Year',
			offset: 0,
			range: 365,
		},
		{
			id: 'all-time',
			label: 'All Time',
			offset: 0,
			range: 400, // TODO: Don't hard code this value.
		},
		{
			id: 'custom-range',
			label: 'Custom Range',
			offset: 0,
			range: 3, // TODO: Should nail down how this is expected to behave.
		},
	];

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

	const handleShortcutSelected = ( shortcut: DateControlPickerShortcut ) => {

		const formattedDate = ( date: Date ) => {
			return date.toISOString().split( 'T' )[ 0 ];
		}

		// We do our date math based on 24 hour increments.
		const millisecondsInOneDay = 1000 * 60 * 60 * 24;

		// Calc new start date based on offset value from shortcut.
		let offsetInMilliseconds = new Date().getTime() - ( millisecondsInOneDay * shortcut.offset );
		const newStartDate = new Date( offsetInMilliseconds );
		setInputStartDate( formattedDate( newStartDate ) ); 

		// Calc new end date based on start date plus range as specified in shortcut.
		offsetInMilliseconds = newStartDate.getTime() - ( millisecondsInOneDay * shortcut.range );
		const newEndDate = new Date( offsetInMilliseconds );
		setInputEndDate( formattedDate( newEndDate ) ); 
	}

	const DateControlPickerContent = () => (
		<div>
			<DateControlPickerDate
				startDate={ inputStartDate }
				endDate={ inputEndDate }
				onStartChange={ changeStartDate }
				onEndChange={ changeEndDate }
				onApply={ handleOnApply }
			/>
			<DateControlPickerShortcuts shortcutList={ shortcutList } onClick={ handleShortcutSelected } />
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
