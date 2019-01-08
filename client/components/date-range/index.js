/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindAll, noop } from 'lodash';
import { DateUtils } from 'react-day-picker';
import classNames from 'classnames';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import DatePicker from 'components/date-picker';
import Popover from 'components/popover';
import DateRangeInputs from './inputs';
import DateRangeHeader from './header';
import DateRangeTrigger from './trigger';

export class DateRange extends Component {
	static propTypes = {
		onDateSelect: PropTypes.func,
		onDateCommit: PropTypes.func,
	};

	static defaultProps = {
		onDateSelect: noop,
		onDateCommit: noop,
	};

	constructor( props ) {
		super( props );

		const endDate = this.props.endDate || this.props.moment();
		const startDate = this.props.startDate || this.props.moment( endDate ).subtract( 1, 'months' );

		this.state = {
			popoverVisible: false,
			staleStartDate: '',
			staleEndDate: '',
			startDate: startDate,
			endDate: endDate,
			staleDatesSaved: false,
			// this need to be independent from startDate because we must independently validate them
			// before updating the central source of truth (ie: startDate)
			textInputStartDate: this.dateToHumanReadable( startDate ),
			textInputEndDate: this.dateToHumanReadable( endDate ),
		};

		bindAll( this, [
			'openPopover',
			'closePopover',
			'onSelectDate',
			'revertDates',
			'commitDates',
			'handleInputChange',
			'handleInputBlur',
		] );

		// Ref to the Trigger <button> used to position the Popover	component
		this.triggerButtonRef = React.createRef();
	}

	openPopover() {
		this.setState( {
			popoverVisible: true,
		} );
	}

	/**
	 * Closes the popover
	 * Note this does not commit the current date state
	 */
	closePopover() {
		this.setState( {
			popoverVisible: false,
		} );

		// As no dates have been explicity accepted ("Apply" not clicked)
		// we need to revert back to the original cached dates
		this.revertDates();
	}

	/**
	 * Updates state with current value of start/end
	 * text inputs
	 * @param  {SyntheticEvent} e the React SyntheticEvent representing the DOM input change Event
	 */
	handleInputChange( e ) {
		const val = e.target.value;

		// Whitelist rather than be too clever...
		const startOrEnd = this.identifyStartEndFromInputId( e.target.id );

		this.setState( {
			[ `textInput${ startOrEnd }Date` ]: val,
		} );
	}

	/**
	 * Identifies the position (start or end) from the supplied
	 * ID attr of an DOM `input` element
	 * @param  {string} inputId the ID attr of the input element
	 * @return {string}         either the "Start" or "End" identifier
	 */
	identifyStartEndFromInputId( inputId ) {
		return inputId.includes( 'start' ) ? 'Start' : 'End';
	}

	/**
	 * Ensure dates are
	 * i) valid
	 * ii) after 01/01/1970 (avoids bugs when really stale dates are treated as valid)
	 * iii) before today (don't allow inputs to select dates that calendar is not allowed to show)
	 *
	 * @param  {moment}  date MomentJS date object
	 * @return {Boolean}      whether date is considered valid or not
	 */
	isValidDate( date ) {
		const today = this.props.moment();
		const epoch = this.props.moment( '01/01/1970', this.getLocaleDateFormat() );

		return date.isValid() && date.isSameOrAfter( epoch ) && date.isSameOrBefore( today );
	}

	/**
	 * Updates the state when the date text inputs are blurred
	 * @param  {SyntheticEvent} e React wrapper for DOM input blur event
	 */
	handleInputBlur( e ) {
		const val = e.target.value;
		const startOrEnd = this.identifyStartEndFromInputId( e.target.id );
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
				textInputStartDate: this.dateToHumanReadable( this.state.startDate ),
				textInputEndDate: this.dateToHumanReadable( this.state.endDate ),
			} );
		}

		const isSameDate = this.state[ `${ startOrEnd.toLowerCase() }Date` ].isSame( date, 'day' );

		// If the new date in the blurred input is valid
		// and it's not the same as the existing value
		if ( this.isValidDate( date ) && ! isSameDate ) {
			this.onSelectDate( date );
		}
	}

	/**
	 * Converts moment dates to a DateRange
	 * as required by Day Picker DateUtils
	 * @param  {MomentJSDate} startDate the start date for the range
	 * @param  {MomentJSDate} endDate   the end date for the range
	 * @return {Object}           the date range object
	 */
	toDateRange( startDate, endDate ) {
		return {
			from: this.momentDateToNative( startDate ),
			to: this.momentDateToNative( endDate ),
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
	onSelectDate( date ) {
		// DateUtils requires a range object with this shape
		const range = this.toDateRange( this.state.startDate, this.state.endDate );

		const rawDay = this.momentDateToNative( date );

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
					textInputStartDate: this.nativeDateToMoment( newRange.from ).format( 'L' ),
					textInputEndDate: this.nativeDateToMoment( newRange.to ).format( 'L' ),
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
	}

	/**
	 * Updates the "stale" data to reflect the current start/end dates
	 * This causes any cached data to be lost and thus the current start/end
	 * dates are persisted. Typically called when user clicks "Apply"
	 */
	commitDates() {
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
	}

	/**
	 * Reverts current start/end dates to the cache "stale" versions
	 * Typically required when the user makes a selection but then dismisses
	 * the DateRange without clicking "Apply"
	 */
	revertDates() {
		this.setState( previousState => {
			const newState = { staleDatesSaved: false };

			if ( previousState.staleStartDate && previousState.staleEndDate ) {
				newState.startDate = previousState.staleStartDate;
				newState.endDate = previousState.staleEndDate;
				newState.textInputStartDate = this.dateToHumanReadable( this.state.staleStartDate );
				newState.textInputEndDate = this.dateToHumanReadable( this.state.staleEndDate );
			}

			return newState;
		} );
	}

	/**
	 * Converts a moment date to a native JS Date object
	 * @param  {MomentJSDate} momentDate a momentjs date object to convert
	 * @return {DATE}            the converted JS Date object
	 */
	momentDateToNative( momentDate ) {
		return momentDate.toDate();
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
	dateToHumanReadable( date ) {
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
	 * Renders the Popover component
	 * @return {ReactComponent} the Popover component
	 */
	renderPopover() {
		const popoverClassNames = classNames( {
			'date-range__popover': true,
			'is-dialog-visible': true, // forces to render when inside a modal. Is there a way to detect this from global state?
		} );

		return (
			<Popover
				className={ popoverClassNames }
				isVisible={ this.state.popoverVisible }
				context={ this.triggerButtonRef.current }
				position="bottom"
				onClose={ this.closePopover }
			>
				<div className="date-range__popover-inner">
					<DateRangeHeader onApplyClick={ this.commitDates } onCancelClick={ this.closePopover } />
					<DateRangeInputs
						startDateValue={ this.state.textInputStartDate }
						endDateValue={ this.state.textInputEndDate }
						onInputChange={ this.handleInputChange }
						onInputBlur={ this.handleInputBlur }
					/>
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
		const now = new Date();

		return (
			<DatePicker
				className="date-range__popover-date-picker"
				showOutsideDays={ false }
				toMonth={ now }
				onSelectDay={ this.onSelectDate }
				selectedDays={ {
					from: this.momentDateToNative( this.state.startDate ),
					to: this.momentDateToNative( this.state.endDate ),
				} }
				numberOfMonths={ window.matchMedia( '(min-width: 480px)' ).matches ? 2 : 1 }
				calendarViewDate={ this.momentDateToNative( this.state.startDate ) }
				disabledDays={ [
					{
						after: now, // you can't look at photos from the future!
					},
				] }
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

		return (
			<div className={ rootClassNames }>
				<DateRangeTrigger
					startDateText={ this.dateToHumanReadable( this.state.startDate ) }
					endDateText={ this.dateToHumanReadable( this.state.endDate ) }
					buttonRef={ this.triggerButtonRef }
					onTriggerClick={ this.openPopover }
				/>
				{ this.renderPopover() }
			</div>
		);
	}
}

export default localize( DateRange );
