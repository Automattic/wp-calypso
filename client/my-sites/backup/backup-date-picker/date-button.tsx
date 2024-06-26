import { Gridicon, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import React, { useState, useMemo } from 'react';
import DatePicker from 'calypso/components/date-picker';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

const DATE_PICKER_OPEN = recordTracksEvent( 'calypso_jetpack_backup_date_picker_open' );

const DateButton: React.FC< Props > = ( {
	selectedDate,
	onDateSelected,
	firstBackupDate,
	disabledDates,
	disabled = false,
} ) => {
	const dispatch = useDispatch();

	const [ pickerVisible, setPickerVisible ] = useState( false );
	const moment = useLocalizedMoment();
	const today = useDateWithOffset( moment() ) as Moment;
	const translate = useTranslate();

	/**
	 * A date has been picked from the calendar.
	 * @param date { Moment } - a moment date object that has been selected on the calendar
	 */
	const handleDatePicked = ( date: Moment ) => {
		onDateSelected( date );
		setPickerVisible( false );
	};

	// Map date strings that should be disabled to Date objects that can be used by the calendar
	const disabledDatesObjects = useMemo( () => {
		return disabledDates
			? disabledDates.map( ( date ) => {
					const momentDate = moment( date );
					return new Date( momentDate.year(), momentDate.month(), momentDate.date() );
			  } )
			: [];
	}, [ disabledDates, moment ] );

	const renderPicker = () => {
		if ( pickerVisible ) {
			return (
				<div className="backup-date-picker__date-button-picker">
					<div className="backup-date-picker__picker-background-screen"> </div>
					<DatePicker
						calendarViewDate={ new Date( selectedDate.year(), selectedDate.month() ) } // sets the month when the calendar opens
						moment={ moment }
						timeReference={ selectedDate.clone() } // Use the current localized time of the selectedDate to adjust against when selecting a date
						onSelectDay={ handleDatePicked }
						selectedDay={
							new Date( selectedDate.year(), selectedDate.month(), selectedDate.date() )
						}
						disabledDays={ [
							{
								before: firstBackupDate
									? new Date(
											firstBackupDate.year(),
											firstBackupDate.month(),
											firstBackupDate.date()
									  )
									: null, // The first known backup date - should be nothing before this.
								after: today // If the offset value of today that factors in the blog's GMT offset is available, use that.
									? new Date( today.year(), today.month(), today.date() )
									: moment().toDate(), // There are no backups of the future.
							},
							// Dates that do not have a backup
							...disabledDatesObjects,
						] }
					/>
				</div>
			);
		}
	};

	/**
	 * Toggle the picker open or closed.
	 * Will fire an event when the picker is opened.
	 */
	const handlePickerToggle = () => {
		if ( ! pickerVisible ) {
			dispatch( DATE_PICKER_OPEN );
		}

		setPickerVisible( ! pickerVisible );
	};

	return (
		<div className="backup-date-picker__date-button-container">
			<Button
				className="backup-date-picker__date-button-button"
				onClick={ handlePickerToggle }
				disabled={ disabled }
			>
				<Gridicon icon="calendar" />
				{ translate( 'Select Date' ) }
			</Button>
			{ renderPicker() }
		</div>
	);
};

type Props = {
	selectedDate: Moment;
	firstBackupDate: Moment | undefined;
	onDateSelected: ( m: Moment ) => void;
	disabledDates: Array< string >;
	disabled?: boolean;
};

export default DateButton;
