import { Popover } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, calendar } from '@wordpress/icons';
import React, { useState, useRef } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import DateControlPickerDate from './stats-date-control-picker-date';
import DateControlPickerShortcuts from './stats-date-control-picker-shortcuts';
import { DateControlPickerProps, DateControlPickerShortcut } from './types';
import './style.scss';

const DateControlPicker = ( {
	buttonLabel,
	dateRange,
	shortcutList,
	selectedShortcut,
	onShortcut,
	onApply,
}: DateControlPickerProps ) => {
	const moment = useLocalizedMoment();
	// Pull dates from provided range.
	const [ inputStartDate, setInputStartDate ] = useState(
		moment( dateRange.chartStart ).format( 'YYYY-MM-DD' )
	);
	const [ inputEndDate, setInputEndDate ] = useState(
		moment( dateRange.chartEnd ).format( 'YYYY-MM-DD' )
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

	const updateLocalStateFromShortcut = ( shortcut: DateControlPickerShortcut ) => {
		const endDate =
			shortcut.offset === 0
				? moment().format( 'YYYY-MM-DD' )
				: moment().subtract( shortcut.offset, 'days' ).format( 'YYYY-MM-DD' );

		const startDate =
			shortcut.range === 0
				? endDate
				: moment( endDate ).subtract( shortcut.range, 'days' ).format( 'YYYY-MM-DD' );

		setInputStartDate( startDate );
		setInputEndDate( endDate );
	};

	const handleOnApply = () => {
		togglePopoverOpened( false );
		onApply( inputStartDate, inputEndDate );
	};

	const handleOnCancel = () => {
		togglePopoverOpened( false );
	};

	const handleShortcutSelected = ( shortcut: DateControlPickerShortcut ) => {
		togglePopoverOpened( false );
		updateLocalStateFromShortcut( shortcut );
		onShortcut( shortcut );
	};

	return (
		<div className="stats-date-control-picker">
			<Button onClick={ () => togglePopoverOpened( ! popoverOpened ) } ref={ infoReferenceElement }>
				{ buttonLabel }
				<Icon className="gridicon" icon={ calendar } />
			</Button>
			<Popover
				position="bottom"
				context={ infoReferenceElement?.current }
				isVisible={ popoverOpened }
				className="stats-date-control-picker__popover-wrapper"
			>
				<div className="stats-date-control-picker__popover-content">
					<DateControlPickerShortcuts
						shortcutList={ shortcutList }
						currentShortcut={ selectedShortcut }
						onClick={ handleShortcutSelected }
					/>
					<DateControlPickerDate
						startDate={ inputStartDate }
						endDate={ inputEndDate }
						onStartChange={ changeStartDate }
						onEndChange={ changeEndDate }
						onApply={ handleOnApply }
						onCancel={ handleOnCancel }
					/>
				</div>
			</Popover>
		</div>
	);
};

export default DateControlPicker;
