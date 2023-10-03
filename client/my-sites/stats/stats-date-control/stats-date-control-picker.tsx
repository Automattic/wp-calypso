import { Popover } from '@automattic/components';
import { Button } from '@wordpress/components';
import moment from 'moment';
import page from 'page';
import qs from 'qs';
import React, { useState, useRef } from 'react';
import DateControlPickerDate from './stats-date-control-picker-date';
import DateControlPickerShortcuts from './stats-date-control-picker-shortcuts';
import { DateControlPickerProps, DateControlPickerShortcut } from './types';

const DateControlPicker = ( {
	slug,
	queryParams,
	shortcutList,
	handleApply,
}: DateControlPickerProps ) => {
	// TODO: remove placeholder values
	const [ inputStartDate, setInputStartDate ] = useState( new Date().toISOString().slice( 0, 10 ) );
	const [ inputEndDate, setInputEndDate ] = useState(
		new Date( new Date().setMonth( new Date().getMonth() - 3 ) ).toISOString().slice( 0, 10 )
	);
	const infoReferenceElement = useRef( null );
	const [ popoverOpened, togglePopoverOpened ] = useState( false );

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

		// expose the values externally
		handleApply( inputStartDate, inputEndDate );

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

	const formatDate = ( date: string ) => {
		return moment( date ).format( 'MMM D, YYYY' );
	};

	return (
		<>
			<Button
				variant="primary"
				onClick={ () => togglePopoverOpened( ! popoverOpened ) }
				ref={ infoReferenceElement }
			>
				{ `${ formatDate( inputStartDate ) } - ${ formatDate( inputEndDate ) }` }
			</Button>
			<Popover
				position="bottom"
				context={ infoReferenceElement?.current }
				isVisible={ popoverOpened }
				// TODO: Remove this inline CSS.
				style={ { minWidth: '260px' } }
			>
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
			</Popover>
		</>
	);
};

export default DateControlPicker;
