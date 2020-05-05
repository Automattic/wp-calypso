/**
 * External dependencies
 */
import React, { Component } from 'react';
import { noop, isNil, isNull, has } from 'lodash';
import { DateUtils } from 'react-day-picker';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import { withLocalizedMoment } from 'components/localized-moment';
import moment from 'moment';

/**
 * Internal dependencies
 */
import DatePicker from 'components/date-picker';
import Popover from 'components/popover';
import { Button } from '@automattic/components';
import DateRangeInputs from './inputs';
import DateRangeHeader from './header';
import DateRangeTrigger from './trigger';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Module variables
 */
const NO_DATE_SELECTED_VALUE = null;

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
		showTriggerClear: PropTypes.bool,
		renderTrigger: PropTypes.func,
		renderHeader: PropTypes.func,
		renderInputs: PropTypes.func,
	};

	static defaultProps = {
		onDateSelect: noop,
		onDateCommit: noop,
		isCompact: false,
		focusedMonth: null,
		showTriggerClear: true,
		renderTrigger: ( props ) => <DateRangeTrigger { ...props } />,
		renderHeader: ( props ) => <DateRangeHeader { ...props } />,
		renderInputs: ( props ) => <DateRangeInputs { ...props } />,
	};

	constructor( props ) {
		super( props );

		// Define the date range that is selectable (ie: not disabled)
		const firstSelectableDate =
			has( this.props, 'firstSelectableDate' ) &&
			this.props.moment( this.props.firstSelectableDate );
		const lastSelectableDate =
			has( this.props, 'lastSelectableDate' ) && this.props.moment( this.props.lastSelectableDate );

		// Clamp start/end dates to ranges (if specified)
		let startDate = isNil( this.props.selectedStartDate )
			? NO_DATE_SELECTED_VALUE
			: this.clampDateToRange( this.props.moment( this.props.selectedStartDate ), {
					dateFrom: firstSelectableDate,
					dateTo: lastSelectableDate,
			  } );

		let endDate = isNil( this.props.selectedEndDate )
			? NO_DATE_SELECTED_VALUE
			: this.clampDateToRange( this.props.moment( this.props.selectedEndDate ), {
					dateFrom: firstSelectableDate,
					dateTo: lastSelectableDate,
			  } );

		// Ensure start is before end otherwise flip the values
		if ( startDate && endDate && endDate.isBefore( startDate ) ) {
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
			textInputStartDate: this.toDateString( startDate ),
			textInputEndDate: this.toDateString( endDate ),
			initialStartDate: startDate, // cache values in case we need to reset to them
			initialEndDate: endDate, // cache values in case we need to reset to them
			focusedMonth: this.props.focusedMonth,
		};

		// Ref to the Trigger <button> used to position the Popover component
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

	closePopoverAndRevert = () => {
		this.closePopover();
		this.revertDates();
	};

	closePopoverAndCommit = () => {
		this.closePopover();
		this.commitDates();
	};

	/**
	 * Updates state with current value of start/end
	 * text inputs
	 *
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
	 * @returns {boolean}      whether date is considered valid or not
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
	 *
	 * @param  {string} val        the value of the input
	 * @param  {string} startOrEnd either "Start" or "End"
	 */
	handleInputBlur = ( val, startOrEnd ) => {
		if ( val === '' ) {
			return;
		}
		const date = this.props.moment( val, this.getLocaleDateFormat() );

		if ( ! date.isValid() ) {
			return; // bail out
		}

		// Either `startDate` or `endDate`
		const stateKey = `${ startOrEnd.toLowerCase() }Date`;

		const isSameDate = ! isNull( this.state[ stateKey ] )
			? this.state[ stateKey ].isSame( date, 'day' )
			: false;

		if ( isSameDate ) {
			return;
		}

		this.onSelectDate( date );
	};

	/**
	 * Updates the currently focused date picker month when one of the
	 * inputs is focused.
	 * http://react-day-picker.js.org/api/DayPicker/#month
	 *
	 * @param  {string} val        the value of the input
	 * @param  {string} startOrEnd either "Start" or "End"
	 */
	handleInputFocus = ( val, startOrEnd ) => {
		if ( val === '' ) {
			return;
		}

		const date = this.props.moment( val, this.getLocaleDateFormat() );

		if ( ! date.isValid() ) {
			return; // bail out
		}

		const numMonthsShowing = this.getNumberOfMonths(); // 2 or 1

		// If we focused the endDate and we're showing more than 1 month
		// then the picker should focus the month before
		if ( startOrEnd === 'End' && numMonthsShowing > 1 ) {
			// moment isn't immutable so this modifies
			// the existing moment instance
			date.subtract( 1, 'months' );
		}

		this.setState( {
			focusedMonth: date.toDate(),
		} );
	};

	/**
	 * Converts moment dates to a DateRange
	 * as required by Day Picker DateUtils
	 *
	 * @param  {MomentJSDate} startDate the start date for the range
	 * @param  {MomentJSDate} endDate   the end date for the range
	 * @returns {object}           the date range object
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
	onSelectDate = ( date ) => {
		if ( ! this.isValidDate( date ) ) {
			return;
		}

		// DateUtils requires a range object with this shape
		const range = this.toDateRange( this.state.startDate, this.state.endDate );

		const rawDay = this.momentDateToJsDate( date );

		// Calculate the new Date range
		const newRange = DateUtils.addDayToRange( rawDay, range );

		// Update state to reflect new date range for
		// calendar and text inputs
		this.setState(
			( previousState ) => {
				// Update to date or `null` which means "not date"
				const newStartDate = isNull( newRange.from )
					? NO_DATE_SELECTED_VALUE
					: this.nativeDateToMoment( newRange.from );
				const newEndDate = isNull( newRange.to )
					? NO_DATE_SELECTED_VALUE
					: this.nativeDateToMoment( newRange.to );

				// Update start/end state values
				let newState = {
					startDate: newStartDate,
					endDate: newEndDate,
					textInputStartDate: this.toDateString( newStartDate ),
					textInputEndDate: this.toDateString( newEndDate ),
				};

				// For first date selection only: "cache" previous dates
				// just in case user doesn't "Apply" and we need to revert
				// to the original dates
				if ( ! previousState.staleDatesSaved ) {
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
			( previousState ) => ( {
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
		this.setState( ( previousState ) => {
			const startDate = previousState.staleStartDate;
			const endDate = previousState.staleEndDate;

			const newState = {
				staleDatesSaved: false,
				startDate: startDate,
				endDate: endDate,
				textInputStartDate: this.toDateString( startDate ),
				textInputEndDate: this.toDateString( endDate ),
			};

			return newState;
		} );
	};

	/**
	 * Resets any currently selected (not commmited!) dates
	 * but leaves stale dates untouched. This makes it possible
	 * for the user to revert back to the previous dates should
	 * they so choose. Required for scenario where user selects dates
	 * then wants to clear that selection entirely but then clicks away
	 * without selecting any dates
	 */
	resetDates = () => {
		this.setState( ( previousState ) => {
			const startDate = previousState.initialStartDate;
			const endDate = previousState.initialEndDate;

			const newState = {
				staleDatesSaved: false,
				startDate: startDate,
				endDate: endDate,
				textInputStartDate: this.toDateString( startDate ),
				textInputEndDate: this.toDateString( endDate ),
			};

			return newState;
		} );
	};

	/**
	 * Fully clears all dates to empty values
	 * affectively saying "get rid of all dates"
	 */
	clearDates = () => {
		this.setState(
			{
				startDate: null,
				endDate: null,
				staleStartDate: null,
				staleEndDate: null,
				textInputStartDate: '',
				textInputEndDate: '',
			},
			() => {
				// Fired to ensure date change is propagated upwards
				this.props.onDateCommit( this.state.startDate, this.state.endDate );
			}
		);
	};

	/**
	 * Converts a moment date to a native JS Date object
	 *
	 * @param  {MomentJSDate} momentDate a momentjs date object to convert
	 * @returns {Date}            the converted JS Date object
	 */
	momentDateToJsDate( momentDate ) {
		return this.props.moment.isMoment( momentDate ) ? momentDate.toDate() : momentDate;
	}

	/**
	 * Converts a native JS Date object to a MomentJS Date object
	 *
	 * @param  {Date} nativeDate date to be converted
	 * @returns {MomentJSDate}            the converted Date
	 */
	nativeDateToMoment( nativeDate ) {
		return this.props.moment( nativeDate );
	}

	/**
	 * Formats a given date to the appropriate format for the
	 * current locale
	 *
	 * @param  {Date|MomentJSDate} date the date to be converted
	 * @returns {string}      the date as a formatted locale string
	 */
	formatDateToLocale( date ) {
		return this.props.moment( date ).format( 'L' );
	}

	/**
	 * 	Gets the locale appropriate date format (eg: "MM/DD/YYYY")
	 *
	 * @returns {string} date format as a string
	 */
	getLocaleDateFormat() {
		return this.props.moment.localeData().longDateFormat( 'L' );
	}

	/**
	 * Enforces that given date is within the bounds of the
	 * range specified
	 *
	 * @param  {Moment} date             momentJS instance
	 * @param  {Moment|Date} options.dateFrom the start of the date range
	 * @param  {Moment|Date} options.dateTo   the end of the date range
	 * @returns {Moment}                  the date clamped to be within the range
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
	 * Converts date-like object to a string suitable
	 * for display in a text input. Also converts
	 * to locale appropriate format.
	 *
	 * @param  {Date|Moment} date the date for conversion
	 * @returns {string}      the date expressed as a locale appropriate string or if null
	 *                       then returns the locale format (eg: MM/DD/YYYY)
	 */
	toDateString( date ) {
		if ( this.props.moment.isMoment( date ) || this.props.moment.isDate( date ) ) {
			return this.formatDateToLocale( this.props.moment( date ) );
		}

		return this.getLocaleDateFormat(); // "MM/DD/YYY" or locale equivalent
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
	 * @returns {Array} configuration to be passed to DatePicker as disabledDays prop
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

	getNumberOfMonths() {
		return window.matchMedia( '(min-width: 480px)' ).matches ? 2 : 1;
	}

	renderDateHelp() {
		const { startDate, endDate } = this.state;

		return (
			<div className="date-range__info" role="status" aria-live="polite">
				{ ! startDate &&
					! endDate &&
					this.props.translate( '{{icon/}} Please select the {{em}}first{{/em}} day.', {
						components: {
							icon: <Gridicon aria-hidden="true" icon="info" />,
							em: <em />,
						},
					} ) }
				{ startDate &&
					! endDate &&
					this.props.translate( '{{icon/}} Please select the {{em}}last{{/em}} day.', {
						components: {
							icon: <Gridicon aria-hidden="true" icon="info" />,
							em: <em />,
						},
					} ) }
				{ startDate && endDate && (
					<Button className="date-range__info-btn" borderless compact onClick={ this.resetDates }>
						{ this.props.translate( '{{icon/}} reset selected dates', {
							components: { icon: <Gridicon aria-hidden="true" icon="cross-small" /> },
						} ) }
					</Button>
				) }
			</div>
		);
	}

	/**
	 * Renders the Popover component
	 *
	 * @returns {ReactComponent} the Popover component
	 */
	renderPopover() {
		const headerProps = {
			onApplyClick: this.commitDates,
			onCancelClick: this.closePopoverAndRevert,
		};

		const inputsProps = {
			startDateValue: this.state.textInputStartDate,
			endDateValue: this.state.textInputEndDate,
			onInputChange: this.handleInputChange,
			onInputBlur: this.handleInputBlur,
			onInputFocus: this.handleInputFocus,
		};

		return (
			<Popover
				className="date-range__popover"
				isVisible={ this.state.popoverVisible }
				context={ this.triggerButtonRef.current }
				position="bottom"
				onClose={ this.closePopoverAndCommit }
			>
				<div className="date-range__popover-inner">
					<div className="date-range__controls">
						{ this.props.renderHeader( headerProps ) }
						{ this.renderDateHelp() }
					</div>
					{ this.props.renderInputs( inputsProps ) }
					{ this.renderDatePicker() }
				</div>
			</Popover>
		);
	}

	/**
	 * Renders the DatePicker component
	 *
	 * @returns {ReactComponent} the DatePicker component
	 */
	renderDatePicker() {
		const fromDate = this.momentDateToJsDate( this.state.startDate );
		const toDate = this.momentDateToJsDate( this.state.endDate );

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

		return (
			<DatePicker
				calendarViewDate={ this.state.focusedMonth }
				rootClassNames={ rootClassNames }
				modifiers={ modifiers }
				showOutsideDays={ false }
				fromMonth={ this.momentDateToJsDate( this.props.firstSelectableDate ) }
				toMonth={ this.momentDateToJsDate( this.props.lastSelectableDate ) }
				onSelectDay={ this.onSelectDate }
				selectedDays={ selected }
				numberOfMonths={ this.getNumberOfMonths() }
				disabledDays={ this.getDisabledDaysConfig() }
			/>
		);
	}

	/**
	 * Renders the component
	 *
	 * @returns {ReactComponent} the DateRange component
	 */
	render() {
		const rootClassNames = classNames( {
			'date-range': true,
			'toggle-visible': this.state.popoverVisible,
		} );

		const triggerProps = {
			startDate: this.state.startDate,
			endDate: this.state.endDate,
			startDateText: this.toDateString( this.state.startDate ),
			endDateText: this.toDateString( this.state.endDate ),
			buttonRef: this.triggerButtonRef,
			onTriggerClick: this.togglePopover,
			onClearClick: this.clearDates,
			triggerText: this.props.triggerText,
			isCompact: this.props.isCompact,
			showClearBtn: this.props.showTriggerClear,
		};

		return (
			<div className={ rootClassNames }>
				{ this.props.renderTrigger( triggerProps ) }
				{ this.renderPopover() }
			</div>
		);
	}
}

export default localize( withLocalizedMoment( DateRange ) );
