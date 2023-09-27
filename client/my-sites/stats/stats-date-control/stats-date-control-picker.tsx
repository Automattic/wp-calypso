import { Popover } from '@automattic/components';
import { Button } from '@wordpress/components';
import page from 'page';
import qs from 'qs';
import React, { useState, useRef } from 'react';
import DateControlPickerDate from './stats-date-control-picker-date';
import DateControlPickerShortcuts from './stats-date-control-picker-shortcuts';
import { DateControlPickerProps } from './types';

const DateControlPicker = ( { slug, queryParams }: DateControlPickerProps ) => {
	// shortcut list will come from props
	const shortcutList = [
		{
			id: 'test',
			label: 'Test shortcut',
			onClick: () => {
				// eslint-disable-next-line no-console
				console.log( 'clicking' );
			},
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

	const infoReferenceElement = useRef( null );
	const [ popoverOpened, togglePopoverOpened ] = useState( false );

	return (
		<>
			<Button
				variant="primary"
				onClick={ () => togglePopoverOpened( ! popoverOpened ) }
				ref={ infoReferenceElement }
			>
				{ `${ inputStartDate } - ${ inputEndDate }` }
			</Button>
			<Popover
				placement="bottom end"
				context={ infoReferenceElement?.current }
				isVisible={ popoverOpened }
			>
				<DateControlPickerDate
					startDate={ inputStartDate }
					endDate={ inputEndDate }
					onStartChange={ changeStartDate }
					onEndChange={ changeEndDate }
					onApply={ handleOnApply }
				/>
				<DateControlPickerShortcuts shortcutList={ shortcutList } />
			</Popover>
		</>
	);
};

export default DateControlPicker;
