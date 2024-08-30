import moment, { Moment } from 'moment';
import React, { useEffect } from 'react';
import { DateUtils } from 'react-day-picker';
import DatePicker from 'calypso/components/date-picker';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

type MomentOrNull = Moment | null;

interface DateRangePickerProps {
	firstSelectableDate: MomentOrNull;
	lastSelectableDate: MomentOrNull;
	selectedStartDate: MomentOrNull;
	selectedEndDate: MomentOrNull;
	moment: typeof moment;
	onDateRangeChange?: ( startDate: MomentOrNull, endDate: MomentOrNull ) => void;
	focusedMonth?: Date;
	numberOfMonths?: number;
}

/**
 * Module variables
 */
const NO_DATE_SELECTED_VALUE = null;
const noop = () => {};

const DateRangePicker = ( {
	firstSelectableDate,
	lastSelectableDate,
	selectedStartDate,
	selectedEndDate,
	moment,
	focusedMonth,
	onDateRangeChange = noop,
	numberOfMonths = 2,
}: DateRangePickerProps ) => {
	/**
	 * Converts a moment date to a native JS Date object
	 * @param  {import('moment').Moment} momentDate a momentjs date object to convert
	 * @returns {Date}            the converted JS Date object
	 */
	function momentDateToJsDate( momentDate: MomentOrNull ) {
		return moment.isMoment( momentDate ) ? momentDate.toDate() : momentDate;
	}

	/**
	 * 	Gets the locale appropriate date format (eg: "MM/DD/YYYY")
	 * @returns {string} date format as a string
	 */
	const getLocaleDateFormat = () => {
		return moment.localeData().longDateFormat( 'L' );
	};

	const isValidDate = ( date: Moment ) => {
		const epoch = moment( '01/01/1970', getLocaleDateFormat() );

		// By default check
		// 1. Looks like a valid date
		// 2. after 01/01/1970 (avoids bugs when really stale dates are treated as valid)
		if ( ! date.isValid() || ! date.isSameOrAfter( epoch ) ) {
			return false;
		}

		// Check not before the first selectable date
		// https://momentjs.com/docs/#/query/is-same-or-before/
		if ( firstSelectableDate && date.isBefore( firstSelectableDate ) ) {
			return false;
		}

		// Check not before the last selectable date
		// https://momentjs.com/docs/#/query/is-same-or-before/
		if ( lastSelectableDate && date.isAfter( lastSelectableDate ) ) {
			return false;
		}

		return true;
	};

	/**
	 * Converts moment dates to a DateRange
	 * as required by Day Picker DateUtils
	 * @param  {import('moment').Moment} startDate the start date for the range
	 * @param  {import('moment').Moment} endDate   the end date for the range
	 * @returns {Object}           the date range object
	 */
	const toDateRange = ( startDate: MomentOrNull, endDate: MomentOrNull ) => {
		return {
			from: momentDateToJsDate( startDate ),
			to: momentDateToJsDate( endDate ),
		};
	};

	/**
	 * Converts a native JS Date object to a MomentJS Date object
	 * @param  {Date} nativeDate date to be converted
	 * @returns {import('moment').Moment}            the converted Date
	 */
	const nativeDateToMoment = ( nativeDate: Date ) => {
		return moment( nativeDate );
	};

	/**
	 * Handles selection (only) of new dates persisting
	 * the values to state. Note that if the user does not
	 * commit the dates (eg: clicking "Apply") then the `revertDates`
	 * method is triggered which restores the previous ("stale") dates.
	 *
	 * Dates are only persisted via the commitDates method.
	 * @param  {import('moment').Moment} date the newly selected date object
	 */
	const selectDate = ( date: Moment ) => {
		if ( ! isValidDate( date ) ) {
			return;
		}

		// DateUtils requires a range object with this shape
		const range = toDateRange( selectedStartDate, selectedEndDate );

		const rawDay = momentDateToJsDate( date );
		if ( ! rawDay ) {
			return;
		}

		// Calculate the new Date range
		const newRange = DateUtils.addDayToRange( rawDay, range );

		// Update to date or `null` which means "not date"
		const newStartDate = ! newRange.from
			? NO_DATE_SELECTED_VALUE
			: nativeDateToMoment( newRange.from );
		const newEndDate = ! newRange.to ? NO_DATE_SELECTED_VALUE : nativeDateToMoment( newRange.to );

		onDateRangeChange( newStartDate, newEndDate );
	};

	/**
	 * Builds an appropriate disabledDays prop for DatePicker
	 * based on firstSelectableDate and lastSelectableDate
	 * config props
	 *
	 * See:
	 * http://react-day-picker.js.org/api/DayPicker/#disabledDays
	 * http://react-day-picker.js.org/docs/matching-days
	 * @returns {Array} configuration to be passed to DatePicker as disabledDays prop
	 */
	const getDisabledDaysConfig = () => {
		const config: { before?: Date; after?: Date } = {};

		if ( firstSelectableDate ) {
			config.before = momentDateToJsDate( firstSelectableDate ) ?? undefined; // disable all days before today
		}

		if ( lastSelectableDate ) {
			config.after = momentDateToJsDate( lastSelectableDate ) ?? undefined; // disable all days before today
		}

		// Requires a wrapping Array
		return [ config ];
	};

	useEffect( () => {
		if ( selectedStartDate && selectedEndDate && selectedStartDate.isAfter( selectedEndDate ) ) {
			onDateRangeChange?.( selectedEndDate, selectedStartDate );
		}
	}, [ selectedStartDate?.format(), selectedEndDate?.format() ] );

	const fromDate = momentDateToJsDate( selectedStartDate );
	const toDate = momentDateToJsDate( selectedEndDate );

	// Add "Range" modifier classes to Day component
	// within Date Picker to aid "range" styling
	// http://react-day-picker.js.org/api/DayPicker/#modifiers
	const modifiers = {
		start: fromDate,
		end: toDate,
		'range-start': fromDate,
		'range-end': toDate,
		range: {
			from: fromDate,
			to: toDate,
		},
	};

	// Dates to be "selected" in Picker
	const selected = [
		fromDate,
		{
			from: fromDate,
			to: toDate,
		},
	];

	const rootClassNames = {
		'date-range__picker': true,
	};

	const calendarInitialDate =
		firstSelectableDate ||
		( lastSelectableDate && moment( lastSelectableDate ).subtract( 1, 'month' ) ) ||
		selectedStartDate;

	return (
		<DatePicker
			calendarViewDate={ focusedMonth }
			calendarInitialDate={ momentDateToJsDate( calendarInitialDate ) }
			rootClassNames={ rootClassNames }
			modifiers={ modifiers }
			showOutsideDays={ false }
			fromMonth={ momentDateToJsDate( firstSelectableDate ) }
			toMonth={ momentDateToJsDate( lastSelectableDate ) }
			onSelectDay={ selectDate }
			selectedDays={ selected }
			numberOfMonths={ numberOfMonths }
			disabledDays={ getDisabledDaysConfig() }
		/>
	);
};

export default withLocalizedMoment( DateRangePicker );
