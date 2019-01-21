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
import DatePicker from 'components/date-picker';
import Button from 'components/button';
import Popover from 'components/popover';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

export class DateRange extends Component {
	static propTypes = {
		onDateSelect: PropTypes.func,
		onDateCommit: PropTypes.func,
	};

	static defaultProps = {
		onDateSelect: noop,
		onDateCommit: noop,
	};

	static dateFormat = 'MM/DD/YYYY';

	constructor( props ) {
		super( props );

		this.state = {
			popoverVisible: false,
			oldStartDate: '',
			oldEndDate: '',
			startDate: this.props.startDate || this.props.moment().subtract( 1, 'months' ),
			endDate: this.props.endDate || this.props.moment(),
			oldDatesSaved: false,
			inputFromDate:
				this.dateToHumanReadable( this.props.startDate ) ||
				this.dateToHumanReadable( this.props.moment().subtract( 1, 'months' ) ),
			inputToDate:
				this.dateToHumanReadable( this.props.endDate ) ||
				this.dateToHumanReadable( this.props.moment() ),
		};

		bindAll( this, [
			'togglePopover',
			'closePopover',
			'onSelectDate',
			'revertDates',
			'commitDates',
			'handleInputChange',
			'handleInputBlur',
		] );

		this.startButtonRef = React.createRef();
	}

	togglePopover() {
		this.setState( {
			popoverVisible: ! this.state.popoverVisible,
			inputFromDate: this.dateToHumanReadable( this.state.startDate ),
			inputToDate: this.dateToHumanReadable( this.state.endDate ),
		} );

		// Close the popover
		this.revertDates();
	}

	closePopover() {
		this.setState( {
			popoverVisible: false,
		} );
	}

	handleInputChange( e ) {
		const val = e.target.value;

		const fromOrTo = e.target.id.includes( 'start' ) ? 'From' : 'To';

		this.setState( {
			[ `input${ fromOrTo }Date` ]: val,
		} );
	}

	handleInputBlur( e ) {
		const val = e.target.value;
		const startOrEnd = e.target.id;
		const date = this.props.moment( val, DateRange.dateFormat );
		const today = this.props.moment();
		const epoch = this.props.moment( '01/01/1970', DateRange.dateFormat );
		const fromDate = this.props.moment( this.state.inputFromDate, DateRange.dateFormat );
		const toDate = this.props.moment( this.state.inputToDate, DateRange.dateFormat );

		// Ensure dates are:
		// i) valid
		// ii) after 01/01/1970 (avoids bugs when really old dates are treated as valid)
		// iii) before today (don't allow inputs to select dates that calendar is not allowed to show)
		const isValidFrom =
			fromDate.isValid() && fromDate.isSameOrAfter( epoch ) && fromDate.isSameOrBefore( today );

		const isValidTo =
			toDate.isValid() && toDate.isSameOrAfter( epoch ) && toDate.isSameOrBefore( today );

		// If either of the date inputs are invalid then revert
		// to current start/end date from state
		if ( ! isValidFrom || ! isValidTo ) {
			this.setState( {
				inputFromDate: this.dateToHumanReadable( this.state.startDate ),
				inputToDate: this.dateToHumanReadable( this.state.endDate ),
			} );
		}

		// If the new date in the blurred input is valid...
		// ...and it's
		if (
			date.isValid() &&
			date.isSameOrAfter( epoch ) &&
			date.isSameOrBefore( today ) &&
			! this.state[ startOrEnd ].isSame( date, 'day' )
		) {
			this.onSelectDate( date );
		}
	}

	onSelectDate( date ) {
		// DateUtils requires a range object with this shape
		const range = {
			from: this.momentDateToNative( this.state.startDate ),
			to: this.momentDateToNative( this.state.endDate ),
		};

		const rawDay = this.momentDateToNative( date );

		// Calculate the new Date range
		const newRange = DateUtils.addDayToRange( rawDay, range );

		// Edge case: Range can sometimes be from: null, to: null
		if ( ! newRange.from || ! newRange.to ) return;

		this.setState(
			previousState => {
				let newState = {
					startDate: this.nativeDateToMoment( newRange.from ),
					endDate: this.nativeDateToMoment( newRange.to ),
					inputFromDate: this.nativeDateToMoment( newRange.from ).format( 'L' ),
					inputToDate: this.nativeDateToMoment( newRange.to ).format( 'L' ),
				};

				// For first date selection only: "cache" previous dates
				// just in case user doesn't "Apply" and we need to revert
				// to the original dates
				if ( ! this.state.oldDatesSaved ) {
					newState = Object.assign( {}, newState, {
						oldStartDate: previousState.startDate,
						oldEndDate: previousState.endDate,
						oldDatesSaved: true, // marks that we have saved old dates
					} );
				}

				return newState;
			},
			() => this.props.onDateSelect( this.state.startDate, this.state.endDate )
		);
	}

	revertDates() {
		this.setState( previousState => {
			const newState = { oldDatesSaved: false };

			if ( previousState.oldStartDate && previousState.oldEndDate ) {
				newState.startDate = previousState.oldStartDate;
				newState.endDate = previousState.oldEndDate;
			}

			return newState;
		} );
	}

	commitDates() {
		this.setState(
			previousState => ( {
				oldStartDate: previousState.startDate, // update cached old dates
				oldEndDate: previousState.endDate, // update cached old dates
				oldDatesSaved: false,
			} ),
			() => {
				this.props.onDateCommit( this.state.startDate, this.state.endDate );
				this.togglePopover();
			}
		);
	}

	momentDateToNative( momentDate ) {
		return momentDate.toDate();
	}

	nativeDateToMoment( nativeDate ) {
		return this.props.moment( nativeDate );
	}

	dateToHumanReadable( date ) {
		return this.props.moment( date ).format( 'L' );
	}

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

	renderPopoverHeader() {
		return (
			<div className="date-range__popover-header">
				<Button className="date-range__cancel-btn" onClick={ this.togglePopover } compact>
					Cancel
				</Button>
				<Button className="date-range__apply-btn" primary onClick={ this.commitDates } compact>
					<Gridicon icon="checkmark" />
					Apply Dates
				</Button>
			</div>
		);
	}

	renderTriggerButton() {
		return (
			<Button
				className="date-range__trigger-btn"
				ref={ this.startButtonRef }
				onClick={ this.togglePopover }
				compact
			>
				<Gridicon className="date-range__trigger-btn-icon" icon="calendar" />
				<span className="date-range__trigger-btn-text">
					{ this.dateToHumanReadable( this.state.startDate ) }-
					{ this.dateToHumanReadable( this.state.endDate ) }
				</span>
				<Gridicon icon="chevron-down" />
			</Button>
		);
	}

	renderPopoverInputs() {
		return (
			<div className="date-range__date-inputs">
				<div className="date-range__date-input date-range__date-input--from">
					<FormLabel htmlFor="startDate">From</FormLabel>
					<FormTextInput
						id="startDate"
						name="startDate"
						value={ this.state.inputFromDate }
						onChange={ this.handleInputChange }
						onBlur={ this.handleInputBlur }
					/>
				</div>
				<div className="date-range__date-input date-range__date-input--to">
					<FormLabel htmlFor="endDate">To</FormLabel>
					<FormTextInput
						id="endDate"
						name="endDate"
						value={ this.state.inputToDate }
						onChange={ this.handleInputChange }
						onBlur={ this.handleInputBlur }
					/>
				</div>
			</div>
		);
	}

	renderPopover() {
		const popoverClassNames = classNames( {
			'date-range__popover': true,
			'is-dialog-visible': true, // forces to render when inside a modal. Is there a way to detect this from global state?
		} );

		return (
			<Popover
				className={ popoverClassNames }
				isVisible={ this.state.popoverVisible }
				context={ this.startButtonRef.current }
				position="bottom"
				onClose={ this.togglePopover }
			>
				<div className="date-range__popover-inner">
					{ this.renderPopoverHeader() }
					{ this.renderPopoverInputs() }
					{ this.renderDatePicker() }
				</div>
			</Popover>
		);
	}

	render() {
		const rootClassNames = classNames( {
			'date-range': true,
			'toggle-visible': this.state.popoverVisible,
		} );

		return (
			<div className={ rootClassNames }>
				{ this.renderTriggerButton() }
				{ this.renderPopover() }
			</div>
		);
	}
}

export default localize( DateRange );
