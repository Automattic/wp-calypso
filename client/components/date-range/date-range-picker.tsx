import moment from 'moment';
import React, { useState } from 'react';
import { DateUtils } from 'react-day-picker';
import DatePicker from 'calypso/components/date-picker';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

type DateType = Date | moment.Moment | null; //TODO: fix this

interface DateRangePickerProps {
	firstSelectableDate: DateType;
	lastSelectableDate: DateType;
	selectedStartDate?: DateType; //?
	selectedEndDate: DateType; //?
	moment: typeof moment;
	onDateRangeChange?: ( startDate: DateType, endDate: DateType ) => void;
	focusedMonthProp?: Date | null;
	numberOfMonths?: number;
}

/**
 * Module variables
 */
const NO_DATE_SELECTED_VALUE = null;
const noop = () => {};

/**
 * Enforces that given date is within the bounds of the
 * range specified
 * @param  {import('moment').Moment}  date             momentJS instance
 * @param  {Object} options          date range
 * @param  {import('moment').Moment | Date}  options.dateFrom the start of the date range
 * @param  {import('moment').Moment | Date}  options.dateTo   the end of the date range
 * @returns {import('moment').Moment}                  the date clamped to be within the range
 */
const clampDateToRange = ( date, { dateFrom, dateTo } ) => {
	// Ensure endDate is within bounds of firstSelectableDate
	if ( dateFrom && date.isBefore( dateFrom ) ) {
		date = dateFrom;
	}

	if ( dateTo && date.isAfter( dateTo ) ) {
		date = dateTo;
	}

	return date;
};

const initStartEndDates = ( {
	firstSelectableDate,
	lastSelectableDate,
	selectedStartDate,
	selectedEndDate,
}: Partial< DateRangePickerProps > ) => {
	// Define the date range that is selectable (ie: not disabled)
	firstSelectableDate = firstSelectableDate && moment( firstSelectableDate );
	lastSelectableDate = lastSelectableDate && moment( lastSelectableDate );

	// Clamp start/end dates to ranges (if specified)
	let startDate =
		selectedStartDate == null
			? NO_DATE_SELECTED_VALUE
			: clampDateToRange( moment( selectedStartDate ), {
					dateFrom: firstSelectableDate,
					dateTo: lastSelectableDate,
			  } );

	let endDate =
		selectedEndDate == null
			? NO_DATE_SELECTED_VALUE
			: clampDateToRange( moment( selectedEndDate ), {
					dateFrom: firstSelectableDate,
					dateTo: lastSelectableDate,
			  } );

	// Ensure start is before end otherwise flip the values
	if ( startDate && endDate && endDate.isBefore( startDate ) ) {
		// flip values via array destructuring (think about it...)
		[ startDate, endDate ] = [ endDate, startDate ];
	}
	return [ startDate, endDate ];
};

const DateRangePicker = ( {
	firstSelectableDate,
	lastSelectableDate,
	selectedStartDate,
	selectedEndDate,
	moment,
	focusedMonthProp = null,
	onDateRangeChange = noop,
	numberOfMonths = 2,
}: DateRangePickerProps ) => {
	const [ initialStartDate, initialEndDate ] = initStartEndDates( {
		firstSelectableDate,
		lastSelectableDate,
		selectedStartDate,
		selectedEndDate,
	} );
	// const [ startDate, setStartDate ] = useState< DateType >( initialStartDate );
	// const [ endDate, setEndDate ] = useState< DateType >( initialEndDate );
	const [ focusedMonth, setFocusedMonth ] = useState< DateType >( focusedMonthProp );
	const [ staleStartDate, setStaleStartDate ] = useState< DateType >( null );
	const [ staleEndDate, setStaleEndDate ] = useState< DateType >( null );
	const [ staleDatesSaved, setStaleDatesSaved ] = useState( false );

	// this needs to be independent from startDate because we must independently validate them
	// before updating the central source of truth (ie: startDate)
	// textInputStartDate: this.toDateString( startDate ),
	// textInputEndDate: this.toDateString( endDate ),
	// initialStartDate: startDate, // cache values in case we need to reset to them
	// initialEndDate: endDate, // cache values in case we need to reset to them
	// focusedMonth: this.props.focusedMonth,

	/**
	 * Converts a moment date to a native JS Date object
	 * @param  {import('moment').Moment} momentDate a momentjs date object to convert
	 * @returns {Date}            the converted JS Date object
	 */
	function momentDateToJsDate( momentDate ) {
		return moment.isMoment( momentDate ) ? momentDate.toDate() : momentDate;
	}

	/**
	 * 	Gets the locale appropriate date format (eg: "MM/DD/YYYY")
	 * @returns {string} date format as a string
	 */
	const getLocaleDateFormat = () => {
		return moment.localeData().longDateFormat( 'L' );
	};

	const isValidDate = ( date ) => {
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
	const toDateRange = ( startDate, endDate ) => {
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
	const nativeDateToMoment = ( nativeDate ) => {
		return moment( nativeDate );
	};

	/**
	 * Formats a given date to the appropriate format for the
	 * current locale
	 * @param  {import('moment').Moment | Date} date the date to be converted
	 * @returns {string}      the date as a formatted locale string
	 */
	const formatDateToLocale = ( date ) => {
		return moment( date ).format( 'L' );
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
	const selectDate = ( date ) => {
		if ( ! isValidDate( date ) ) {
			return;
		}

		// DateUtils requires a range object with this shape
		const range = toDateRange( selectedStartDate, selectedEndDate );

		const rawDay = momentDateToJsDate( date );

		// Calculate the new Date range
		const newRange = DateUtils.addDayToRange( rawDay, range );

		// Update to date or `null` which means "not date"
		const newStartDate =
			newRange.from === null ? NO_DATE_SELECTED_VALUE : nativeDateToMoment( newRange.from );
		const newEndDate =
			newRange.to === null ? NO_DATE_SELECTED_VALUE : nativeDateToMoment( newRange.to );

		// For first date selection only: "cache" previous dates
		// just in case user doesn't "Apply" and we need to revert
		// to the original dates
		if ( ! staleDatesSaved ) {
			setStaleStartDate( selectedStartDate );
			setStaleEndDate( selectedEndDate );
			setStaleDatesSaved( true ); // marks that we have saved stale dates
		}
		// setStartDate( newStartDate );
		// setEndDate( newEndDate );

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
			config.before = momentDateToJsDate( firstSelectableDate ); // disable all days before today
		}

		if ( lastSelectableDate ) {
			config.after = momentDateToJsDate( lastSelectableDate ); // disable all days before today
		}

		// Requires a wrapping Array
		return [ config ];
	};

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
			calendarInitialDate={ momentDateToJsDate( calendarInitialDate ) ?? null }
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
