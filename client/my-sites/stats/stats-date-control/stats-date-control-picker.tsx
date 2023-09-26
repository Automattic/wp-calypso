import { Dropdown, Button } from '@wordpress/components';
import moment from 'moment';
import page from 'page';
import qs from 'qs';
import React, { useState } from 'react';
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

	const formatDate = ( date: string ) => {
		return moment( date ).format( 'MMM D, YYYY' );
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
					{ `${ formatDate( inputStartDate ) } - ${ formatDate( inputEndDate ) }` }
				</Button>
			) }
			renderContent={ () => <DateControlPickerContent /> }
		/>
	);
};

export default DateControlPicker;
