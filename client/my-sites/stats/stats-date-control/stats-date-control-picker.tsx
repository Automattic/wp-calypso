import { Dropdown, Button } from '@wordpress/components';
import page from 'page';
import qs from 'qs';
import React, { useState } from 'react';
import DateControlPickerDate from './stats-date-control-picker-date';
import DateControlPickerShortcuts from './stats-date-control-picker-shortcuts';
import { DateControlPickerProps, DateControlPickerShortcut } from './types';

const DateControlPicker = ( { slug, queryParams, shortcutList }: DateControlPickerProps ) => {
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
		// Shared date math.
		const calcNewDateWithOffset = ( date: Date, offset: number ): Date => {
			// We do our date math based on 24 hour increments.
			const millisecondsInOneDay = 1000 * 60 * 60 * 24;
			const newDateInMilliseconds = date.getTime() - millisecondsInOneDay * offset;
			return new Date( newDateInMilliseconds );
		};

		// Shared date formatting.
		const formattedDate = ( date: Date ) => {
			return date.toISOString().split( 'T' )[ 0 ];
		};

		// Calc new start date based on offset value from shortcut.
		const newStartDate = calcNewDateWithOffset( new Date(), shortcut.offset );
		setInputStartDate( formattedDate( newStartDate ) );

		// Calc new end date based on start date plus range as specified in shortcut.
		const newEndDate = calcNewDateWithOffset( newStartDate, shortcut.range );
		setInputEndDate( formattedDate( newEndDate ) );
	};

	const DateControlPickerContent = () => (
		// TODO: Remove this inline CSS.
		<div style={ { minWidth: '260px' } }>
			<DateControlPickerDate
				startDate={ inputStartDate }
				endDate={ inputEndDate }
				onStartChange={ changeStartDate }
				onEndChange={ changeEndDate }
				onApply={ handleOnApply }
			/>
			<DateControlPickerShortcuts
				shortcutList={ shortcutList }
				onClick={ handleShortcutSelected }
			/>
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
