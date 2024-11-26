import { Popover } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { debounce } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import DateRangePicker from './date-range-picker';
import DateRangeFooter from './footer';
import DateRangeHeader from './header';
import DateRangeInputs from './inputs';
import Shortcuts from './shortcuts';
import DateRangeTrigger from './trigger';

import './style.scss';

/**
 * Module variables
 */
const NO_DATE_SELECTED_VALUE = null;
const noop = () => {};

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
		renderFooter: PropTypes.func,
		renderInputs: PropTypes.func,
		displayShortcuts: PropTypes.bool,
		rootClass: PropTypes.string,
		useArrowNavigation: PropTypes.bool,
		overlay: PropTypes.node,
		customTitle: PropTypes.string,
		onShortcutClick: PropTypes.func,
		trackExternalDateChanges: PropTypes.bool,
	};

	static defaultProps = {
		onDateSelect: noop,
		onDateCommit: noop,
		isCompact: false,
		focusedMonth: null,
		showTriggerClear: true,
		renderTrigger: ( props ) => <DateRangeTrigger { ...props } />,
		renderHeader: ( props ) => <DateRangeHeader { ...props } />,
		renderFooter: ( props ) => <DateRangeFooter { ...props } />,
		renderInputs: ( props ) => <DateRangeInputs { ...props } />,
		displayShortcuts: false,
		rootClass: '',
		useArrowNavigation: false,
		overlay: null,
		customTitle: '',
		trackExternalDateChanges: false,
	};

	constructor( props ) {
		super( props );

		// Define the date range that is selectable (ie: not disabled)
		const firstSelectableDate =
			this.props.firstSelectableDate && this.props.moment( this.props.firstSelectableDate );
		const lastSelectableDate =
			this.props.lastSelectableDate && this.props.moment( this.props.lastSelectableDate );

		// Clamp start/end dates to ranges (if specified)
		let startDate =
			this.props.selectedStartDate == null
				? NO_DATE_SELECTED_VALUE
				: this.clampDateToRange( this.props.moment( this.props.selectedStartDate ), {
						dateFrom: firstSelectableDate,
						dateTo: lastSelectableDate,
				  } );

		let endDate =
			this.props.selectedEndDate == null
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
			staleStartDate: null,
			staleEndDate: null,
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
			numberOfMonths: this.getNumberOfMonths(),
		};

		// Ref to the Trigger <button> used to position the Popover component
		this.triggerButtonRef = createRef();
		this.throttledHandleResize = debounce( () => {
			this.setState( {
				numberOfMonths: this.getNumberOfMonths(),
			} );
		}, 250 );
	}

	componentDidMount() {
		window.addEventListener( 'resize', this.throttledHandleResize );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.throttledHandleResize );
	}

	/**
	 * Opens the popover
	 * Note this does not commit the current date state
	 */
	openPopover = () => {
		const newState = {
			popoverVisible: true,
		};
		if ( this.props.trackExternalDateChanges ) {
			newState.startDate = this.props.selectedStartDate;
			newState.endDate = this.props.selectedEndDate;
			newState.textInputStartDate = this.toDateString( this.props.selectedStartDate );
			newState.textInputEndDate = this.toDateString( this.props.selectedEndDate );
			newState.staleStartDate = this.props.selectedStartDate;
			newState.staleEndDate = this.props.selectedEndDate;
		}
		this.setState( newState );
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
	 * @param  {string} val        the value of the input
	 * @param  {string} startOrEnd either "Start" or "End"
	 */
	handleInputChange = ( val, startOrEnd ) => {
		this.setState( {
			[ `textInput${ startOrEnd }Date` ]: val,
		} );
	};

	/**
	 * Updates the state when the date text inputs are blurred
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

		const isSameDate =
			this.state[ stateKey ] !== null ? this.state[ stateKey ].isSame( date, 'day' ) : false;

		if ( isSameDate ) {
			return;
		}
		// Should we juggle the dates more??
		if ( ! this.state.startDate ) {
			this.setState( {
				startDate: date,
			} );
			return;
		}

		this.setState( {
			[ stateKey ]: date,
		} );
	};

	/**
	 * Updates the currently focused date picker month when one of the
	 * inputs is focused.
	 * http://react-day-picker.js.org/api/DayPicker/#month
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
		this.setState(
			( previousState ) => {
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
			},
			() => {
				this.props.onDateCommit( this.state.startDate, this.state.endDate );
			}
		);
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
	 * Formats a given date to the appropriate format for the
	 * current locale
	 * @param  {import('moment').Moment | Date} date the date to be converted
	 * @returns {string}      the date as a formatted locale string
	 */
	formatDateToLocale( date ) {
		return this.props.moment( date ).format( 'L' );
	}

	/**
	 * 	Gets the locale appropriate date format (eg: "MM/DD/YYYY")
	 * @returns {string} date format as a string
	 */
	getLocaleDateFormat() {
		return this.props.moment.localeData().longDateFormat( 'L' );
	}

	/**
	 * Enforces that given date is within the bounds of the
	 * range specified
	 * @param  {import('moment').Moment}  date             momentJS instance
	 * @param  {Object} options          date range
	 * @param  {import('moment').Moment | Date}  options.dateFrom the start of the date range
	 * @param  {import('moment').Moment | Date}  options.dateTo   the end of the date range
	 * @returns {import('moment').Moment}                  the date clamped to be within the range
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
	 * @param  {import('moment').Moment | Date} date the date for conversion
	 * @returns {string}      the date expressed as a locale appropriate string or if null
	 *                       then returns the locale format (eg: MM/DD/YYYY)
	 */
	toDateString( date ) {
		if ( this.props.moment.isMoment( date ) || this.props.moment.isDate( date ) ) {
			return this.formatDateToLocale( this.props.moment( date ) );
		}

		return this.getLocaleDateFormat(); // "MM/DD/YYY" or locale equivalent
	}

	getNumberOfMonths() {
		return window.matchMedia( '(min-width: 520px)' ).matches ? 2 : 1;
	}

	handleDateRangeChange = ( startDate, endDate ) => {
		this.setState( {
			startDate,
			endDate,
			textInputStartDate: this.toDateString( startDate ),
			textInputEndDate: this.toDateString( endDate ),
		} );
		this.props.onDateSelect && this.props.onDateSelect( startDate, endDate );
	};

	/**
	 * Renders the Popover component
	 * @returns {import('react').Element} the Popover component
	 */
	renderPopover() {
		const headerProps = {
			customTitle: this.props.customTitle,
			startDate: this.state.startDate,
			endDate: this.state.endDate,
			resetDates: this.resetDates,
		};

		const footerProps = {
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
				onClose={ this.closePopover }
			>
				<div className="date-range__popover-content">
					<div
						className={ clsx( 'date-range__popover-inner', {
							'date-range__popover-inner__hasoverlay': !! this.props.overlay,
						} ) }
					>
						{ this.props.overlay && (
							<div className="date-range__popover-inner-overlay">{ this.props.overlay }</div>
						) }
						{ this.props.renderHeader( headerProps ) }
						{ this.props.renderInputs( inputsProps ) }
						{ this.renderDatePicker() }
						{ this.props.renderFooter( footerProps ) }
					</div>
					{ /* Render shortcuts to the right of the calendar */ }
					{ this.props.displayShortcuts && (
						<div className="date-range-picker-shortcuts">
							<Shortcuts
								onClick={ this.handleDateRangeChange }
								locked={ !! this.props.overlay }
								startDate={ this.state.startDate }
								endDate={ this.state.endDate }
								onShortcutClick={ this.props.onShortcutClick } // for tracking shortcut clicks
							/>
						</div>
					) }
				</div>
			</Popover>
		);
	}

	/**
	 * Renders the DatePicker component
	 * @returns {import('react').Element} the DatePicker component
	 */
	renderDatePicker() {
		return (
			<DateRangePicker
				firstSelectableDate={ this.props.firstSelectableDate }
				lastSelectableDate={ this.props.lastSelectableDate }
				selectedStartDate={ this.state.startDate }
				selectedEndDate={ this.state.endDate }
				onDateRangeChange={ this.handleDateRangeChange }
				focusedMonth={ this.state.focusedMonth }
				numberOfMonths={ this.state.numberOfMonths }
				useArrowNavigation={ this.props.useArrowNavigation }
			/>
		);
	}

	/**
	 * Renders the component
	 * @returns {import('react').Element} the DateRange component
	 */
	render() {
		const rootClassNames = clsx(
			{
				'date-range': true,
				'toggle-visible': this.state.popoverVisible,
			},
			this.props.rootClass
		);

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
