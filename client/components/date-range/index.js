/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { noop, isNil, has } from 'lodash';
import { DateUtils } from 'react-day-picker';
import classNames from 'classnames';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { localize, moment } from 'i18n-calypso';
import DatePicker from 'components/date-picker';
import Popover from 'components/popover';
import DateRangeInputs from './inputs';
import DateRangeHeader from './header';
import DateRangeTrigger from './trigger';

export class DateRange extends Component {
	static propTypes = {
		selectedStartDate: PropTypes.oneOfType( [
			PropTypes.instanceOf( Date ),
			PropTypes.instanceOf( moment ),
		] ),
		selectedEndDate: PropTypes.oneOfType( [
			PropTypes.instanceOf( Date ),
			PropTypes.instanceOf( moment ),
		] ),
		onDateSelect: PropTypes.func,
		onDateCommit: PropTypes.func,
		firstSelectableDate: PropTypes.oneOfType( [
			PropTypes.instanceOf( Date ),
			PropTypes.instanceOf( moment ),
		] ),
		lastSelectableDate: PropTypes.oneOfType( [
			PropTypes.instanceOf( Date ),
			PropTypes.instanceOf( moment ),
		] ),
		triggerText: PropTypes.func,
		isCompact: PropTypes.bool,
		renderTrigger: PropTypes.func,
		renderHeader: PropTypes.func,
		renderInputs: PropTypes.func,
	};

	static defaultProps = {
		onDateSelect: noop,
		onDateCommit: noop,
		isCompact: false,
		renderTrigger: props => <DateRangeTrigger { ...props } />,
		renderHeader: props => <DateRangeHeader { ...props } />,
		renderInputs: props => <DateRangeInputs { ...props } />,
	};

	constructor( props ) {
		super( props );

		// Define the date range as Moment instances
		const firstSelectableDate =
			has( this.props, 'firstSelectableDate' ) &&
			this.props.moment( this.props.firstSelectableDate );
		const lastSelectableDate =
			has( this.props, 'lastSelectableDate' ) && this.props.moment( this.props.lastSelectableDate );

		// Clamp dates to ranges (if specified)
		let startDate;
		let endDate;

		endDate = isNil( this.props.selectedEndDate )
			? this.props.moment()
			: this.props.moment( this.props.selectedEndDate );

		endDate = this.clampDateToRange( endDate, {
			dateFrom: firstSelectableDate,
			dateTo: lastSelectableDate,
		} );

		startDate = isNil( this.props.selectedStartDate )
			? this.props.moment( endDate ).subtract( 1, 'months' )
			: this.props.moment( this.props.selectedStartDate );

		startDate = this.clampDateToRange( startDate, {
			dateFrom: firstSelectableDate,
			dateTo: lastSelectableDate,
		} );

		// Ensure start is before end otherwise flip the values
		if ( endDate.isBefore( startDate ) ) {
			// flip values via array destructuring (think about it...)
			[ startDate, endDate ] = [ endDate, startDate ];
		}

		// Build initial state
		this.state = {
			popoverVisible: false,
			staleStartDate: '',
			staleEndDate: '',
			startDate: startDate,
			endDate: endDate,
			staleDatesSaved: false,
			// this needs to be independent from startDate because we must independently validate them
			// before updating the central source of truth (ie: startDate)
			textInputStartDate: this.formatDateToLocale( startDate ),
			textInputEndDate: this.formatDateToLocale( endDate ),
		};

		// Ref to the Trigger <button> used to position the Popover	component
		this.triggerButtonRef = React.createRef();
	}

	/**
	 * Opens the popover
	 * Note this does not commit the current date state
	 */
	openPopover = () => {
		this.setState( {
			popoverVisible: true,
		} );
	};

	/**
	 * Closes the popover
	 * Note this does not commit the current date state
	 */
	closePopover = () => {
		this.setState( {
			popoverVisible: false,
		} );

		// As no dates have been explicity accepted ("Apply" not clicked)
		// we need to revert back to the original cached dates
		this.revertDates();
	};

	/**
	 * Toggles the popover between open/closed
	 * Note this does not commit the current date state
	 */
	togglePopover = () => {
		if ( this.state.popoverVisible ) {
			this.closePopover();
		} else {
			this.openPopover();
		}
	};

	/**
	 * Updates state with current value of start/end
	 * text inputs
	 * @param  {string} val        the value of the input
	 * @param  {string} startOrEnd either "Start" or "End"
	 */
	handleInputChange = ( val, startOrEnd ) => {
		this.setState( {
			[ `textInput${ startOrEnd }Date` ]: val,
		} );
	};

	/**
	 * Ensure dates are valid according to standard rules
	 * and special configuration component config props
	 *
	 * @param  {moment}  date MomentJS date object
	 * @return {Boolean}      whether date is considered valid or not
	 */
	isValidDate( date ) {
		const { firstSelectableDate, lastSelectableDate } = this.props;

		const epoch = this.props.moment( '01/01/1970', this.getLocaleDateFormat() );

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
	}

	/**
	 * Updates the state when the date text inputs are blurred
	 * @param  {string} val        the value of the input
	 * @param  {string} startOrEnd either "Start" or "End"
	 */
	handleInputBlur = ( val, startOrEnd ) => {
		const date = this.props.moment( val, this.getLocaleDateFormat() );

		const fromDate = this.props.moment( this.state.textInputStartDate, this.getLocaleDateFormat() );
		const toDate = this.props.moment( this.state.textInputEndDate, this.getLocaleDateFormat() );

		// Check date validity
		const isValidFrom = this.isValidDate( fromDate );
		const isValidTo = this.isValidDate( toDate );

		// If either of the date inputs are invalid then revert
		// to current start/end date from state
		if ( ! isValidFrom || ! isValidTo ) {
			this.setState( {
				textInputStartDate: this.formatDateToLocale( this.state.startDate ),
				textInputEndDate: this.formatDateToLocale( this.state.endDate ),
			} );
		}

		const isSameDate = this.state[ `${ startOrEnd.toLowerCase() }Date` ].isSame( date, 'day' );

		// If the new date in the blurred input is valid
		// and it's not the same as the existing value
		if ( this.isValidDate( date ) && ! isSameDate ) {
			this.onSelectDate( date );
		}
	};

	/**
	 * Converts moment dates to a DateRange
	 * as required by Day Picker DateUtils
	 * @param  {MomentJSDate} startDate the start date for the range
	 * @param  {MomentJSDate} endDate   the end date for the range
	 * @return {Object}           the date range object
	 */
	toDateRange( startDate, endDate ) {
		return {
			from: this.momentDateToJsDate( startDate ),
			to: this.momentDateToJsDate( endDate ),
		};
	}

	/**
	 * Handles selection (only) of new dates persisting
	 * the values to state. Note that if the user does not
	 * commit the dates (eg: clicking "Apply") then the `revertDates`
	 * method is triggered which restores the previous ("stale") dates.
	 *
	 * Dates are only persisted via the commitDates method.
	 *
	 * @param  {MomentJSDate} date the newly selected date object
	 */
	onSelectDate = date => {
		// DateUtils requires a range object with this shape
		const range = this.toDateRange( this.state.startDate, this.state.endDate );

		const rawDay = this.momentDateToJsDate( date );

		// Calculate the new Date range
		const newRange = DateUtils.addDayToRange( rawDay, range );

		// Edge case: Range can sometimes be from: null, to: null
		if ( ! newRange.from || ! newRange.to ) return;

		// Update state to reflect new date range for
		// calendar and text inputs
		this.setState(
			previousState => {
				let newState = {
					startDate: this.nativeDateToMoment( newRange.from ),
					endDate: this.nativeDateToMoment( newRange.to ),
					textInputStartDate: this.nativeDateToMoment( newRange.from ).format(
						this.getLocaleDateFormat()
					),
					textInputEndDate: this.nativeDateToMoment( newRange.to ).format(
						this.getLocaleDateFormat()
					),
				};

				// For first date selection only: "cache" previous dates
				// just in case user doesn't "Apply" and we need to revert
				// to the original dates
				if ( ! this.state.staleDatesSaved ) {
					newState = {
						...newState,
						staleStartDate: previousState.startDate,
						staleEndDate: previousState.endDate,
						staleDatesSaved: true, // marks that we have saved stale dates
					};
				}

				return newState;
			},
			() => {
				// Trigger callback prop to allow parent components to consume
				// this components state
				this.props.onDateSelect( this.state.startDate, this.state.endDate );
			}
		);
	};

	/**
	 * Updates the "stale" data to reflect the current start/end dates
	 * This causes any cached data to be lost and thus the current start/end
	 * dates are persisted. Typically called when user clicks "Apply"
	 */
	commitDates = () => {
		this.setState(
			previousState => ( {
				staleStartDate: previousState.startDate, // update cached stale dates
				staleEndDate: previousState.endDate, // update cached stale dates
				staleDatesSaved: false,
			} ),
			() => {
				this.props.onDateCommit( this.state.startDate, this.state.endDate );
				this.closePopover();
			}
		);
	};

	/**
	 * Reverts current start/end dates to the cache "stale" versions
	 * Typically required when the user makes a selection but then dismisses
	 * the DateRange without clicking "Apply"
	 */
	revertDates = () => {
		this.setState( previousState => {
			const newState = { staleDatesSaved: false };

			if ( previousState.staleStartDate && previousState.staleEndDate ) {
				newState.startDate = previousState.staleStartDate;
				newState.endDate = previousState.staleEndDate;
				newState.textInputStartDate = this.formatDateToLocale( this.state.staleStartDate );
				newState.textInputEndDate = this.formatDateToLocale( this.state.staleEndDate );
			}

			return newState;
		} );
	};

	/**
	 * Converts a moment date to a native JS Date object
	 * @param  {MomentJSDate} momentDate a momentjs date object to convert
	 * @return {DATE}            the converted JS Date object
	 */
	momentDateToJsDate( momentDate ) {
		return this.props.moment.isMoment( momentDate ) ? momentDate.toDate() : momentDate;
	}

	/**
	 * Converts a native JS Date object to a MomentJS Date object
	 * @param  {Date} nativeDate date to be converted
	 * @return {MomentJSDate}            the converted Date
	 */
	nativeDateToMoment( nativeDate ) {
		return this.props.moment( nativeDate );
	}

	/**
	 * Formats a given date to the appropriate format for the
	 * current locale
	 * @param  {Date|MomentJSDate} date the date to be converted
	 * @return {String}      the date as a formatted locale string
	 */
	formatDateToLocale( date ) {
		return this.props.moment( date ).format( 'L' );
	}

	/**
	 * 	Gets the locale appropriate date format (eg: "MM/DD/YYYY")
	 * @return {String} date format as a string
	 */
	getLocaleDateFormat() {
		return this.props.moment.localeData().longDateFormat( 'L' );
	}

	/**
	 * Enforces that given date is within the bounds of the
	 * range specified
	 * @param  {Moment} date             momentJS instance
	 * @param  {Moment|Date} options.dateFrom the start of the date range
	 * @param  {Moment|Date} options.dateTo   the end of the date range
	 * @return {Moment}                  the date clamped to be within the range
	 */
	clampDateToRange( date, { dateFrom, dateTo } ) {
		// Ensure endDate is within bounds of firstSelectableDate
		if ( dateFrom && date.isBefore( dateFrom ) ) {
			date = dateFrom;
		}

		if ( dateTo && date.isAfter( dateTo ) ) {
			date = dateTo;
		}

		return date;
	}

	/**
	 * Builds an appropriate disabledDays prop for DatePicker
	 * based on firstSelectableDate and lastSelectableDate
	 * config props
	 *
	 * See:
	 * http://react-day-picker.js.org/api/DayPicker/#disabledDays
	 * http://react-day-picker.js.org/docs/matching-days
	 *
	 * @return {array} configuration to be passed to DatePicker as disabledDays prop
	 */
	getDisabledDaysConfig() {
		const { firstSelectableDate, lastSelectableDate } = this.props;

		const config = {};

		if ( firstSelectableDate ) {
			config.before = this.momentDateToJsDate( firstSelectableDate ); // disable all days before today
		}

		if ( lastSelectableDate ) {
			config.after = this.momentDateToJsDate( lastSelectableDate ); // disable all days before today
		}

		// Requires a wrapping Array
		return [ config ];
	}

	/**
	 * Renders the Popover component
	 * @return {ReactComponent} the Popover component
	 */
	renderPopover() {
		const headerProps = {
			onApplyClick: this.commitDates,
			onCancelClick: this.closePopover,
		};

		const inputsProps = {
			startDateValue: this.state.textInputStartDate,
			endDateValue: this.state.textInputEndDate,
			onInputChange: this.handleInputChange,
			onInputBlur: this.handleInputBlur,
		};

		return (
			<Popover
				className="date-range__popover"
				isVisible={ this.state.popoverVisible }
				context={ this.triggerButtonRef.current }
				position="bottom"
				onClose={ this.closePopover }
			>
				<div className="date-range__popover-inner">
					{ this.props.renderInputs( inputsProps ) }
					{ this.props.renderHeader( headerProps ) }
					{ this.renderDatePicker() }
				</div>
			</Popover>
		);
	}

	/**
	 * Renders the DatePicker component
	 * @return {ReactComponent} the DatePicker component
	 */
	renderDatePicker() {
		return (
			<DatePicker
				className="date-range__popover-date-picker"
				showOutsideDays={ false }
				fromMonth={ this.momentDateToJsDate( this.props.firstSelectableDate ) }
				toMonth={ this.momentDateToJsDate( this.props.lastSelectableDate ) }
				onSelectDay={ this.onSelectDate }
				selectedDays={ {
					from: this.momentDateToJsDate( this.state.startDate ),
					to: this.momentDateToJsDate( this.state.endDate ),
				} }
				numberOfMonths={ window.matchMedia( '(min-width: 480px)' ).matches ? 2 : 1 }
				initialMonth={ this.momentDateToJsDate( this.state.startDate ) }
				disabledDays={ this.getDisabledDaysConfig() }
			/>
		);
	}

	/**
	 * Renders the component
	 * @return {ReactComponent} the DateRange component
	 */
	render() {
		const rootClassNames = classNames( {
			'date-range': true,
			'toggle-visible': this.state.popoverVisible,
		} );

		const triggerProps = {
			startDateText: this.formatDateToLocale( this.state.startDate ),
			endDateText: this.formatDateToLocale( this.state.endDate ),
			buttonRef: this.triggerButtonRef,
			onTriggerClick: this.togglePopover,
			triggerText: this.props.triggerText,
			isCompact: this.props.isCompact,
		};

		return (
			<div className={ rootClassNames }>
				{ this.props.renderTrigger( triggerProps ) }
				{ this.renderPopover() }
			</div>
		);
	}
}

export default localize( DateRange );
