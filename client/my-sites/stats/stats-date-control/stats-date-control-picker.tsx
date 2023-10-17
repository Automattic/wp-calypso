import { Popover } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, calendar } from '@wordpress/icons';
import moment from 'moment';
import page from 'page';
import qs from 'qs';
import React, { useState, useRef } from 'react';
import DateControlPickerDate from './stats-date-control-picker-date';
import DateControlPickerShortcuts from './stats-date-control-picker-shortcuts';
import { DateControlPickerProps, DateControlPickerShortcut } from './types';
import './style.scss';

const DateControlPicker = ( {
	slug,
	queryParams,
	shortcutList,
	handleApply,
}: DateControlPickerProps ) => {
	// TODO: remove placeholder values
	const [ inputStartDate, setInputStartDate ] = useState(
		moment().subtract( 6, 'days' ).format( 'YYYY-MM-DD' )
	);
	const [ inputEndDate, setInputEndDate ] = useState( moment().format( 'YYYY-MM-DD' ) );
	const [ currentShortcut, setCurrentShortcut ] = useState( 'today' );
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

	const generateNewLink = ( period: string, startDate: string, endDate: string ) => {
		const newRangeQuery = qs.stringify(
			Object.assign( {}, queryParams, { chartStart: startDate, chartEnd: endDate } ),
			{
				addQueryPrefix: true,
			}
		);
		const url = `/stats/${ period }/${ slug }`;
		return `${ url }${ newRangeQuery }`;
	};

	const handleOnApply = () => {
		togglePopoverOpened( false );
		const href = generateNewLink( 'day', inputStartDate, inputEndDate );
		page( href );
	};

	const handleOnCancel = () => {
		togglePopoverOpened( false );
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

		setCurrentShortcut( shortcut.id || '' );
	};

	const formatDate = ( date: string ) => {
		return moment( date ).format( 'MMM D, YYYY' );
	};

	return (
		<div className="stats-date-control-picker">
			<Button onClick={ () => togglePopoverOpened( ! popoverOpened ) } ref={ infoReferenceElement }>
				{ `${ formatDate( inputStartDate ) } - ${ formatDate( inputEndDate ) }` }
				<Icon className="gridicon" icon={ calendar } />
			</Button>
			<Popover
				position="bottom"
				context={ infoReferenceElement?.current }
				isVisible={ popoverOpened }
			>
				<div className="stats-date-control-picker__popover-content">
					<DateControlPickerDate
						startDate={ inputStartDate }
						endDate={ inputEndDate }
						onStartChange={ changeStartDate }
						onEndChange={ changeEndDate }
						onApply={ handleOnApply }
						onCancel={ handleOnCancel }
					/>
					<DateControlPickerShortcuts
						shortcutList={ shortcutList }
						currentShortcut={ currentShortcut }
						onClick={ handleShortcutSelected }
					/>
				</div>
			</Popover>
		</div>
	);
};

export default DateControlPicker;
