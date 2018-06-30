/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindAll } from 'lodash';
import { DateUtils } from 'react-day-picker';
import classNames from 'classnames';
/**
 * Internal dependencies
 */
import Button from 'components/button';
import Popover from 'components/popover';
import DatePicker from 'components/date-picker';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

export class MediaDateRange extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			popoverVisible: false,
			oldStartDate: '',
			oldEndDate: '',
			startDate: this.props.startDate || this.props.moment().subtract( 1, 'months' ),
			endDate: this.props.endDate || this.props.moment(),
			oldDatesSaved: false,
		};

		bindAll( this, [
			'togglePopover',
			'closePopover',
			'onSelectDate',
			'revertDates',
			'commitDates',
		] );

		this.startButtonRef = React.createRef();
	}

	togglePopover() {
		this.setState( {
			popoverVisible: ! this.state.popoverVisible,
		} );

		// Close the popover
		this.revertDates();
	}

	closePopover() {
		this.setState( {
			popoverVisible: false,
		} );
	}

	momentDateToNative( momentDate ) {
		return momentDate.toDate();
	}

	nativeDateToMoment( nativeDate ) {
		return this.props.moment( nativeDate );
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

		this.setState( previousState => {
			let newState = {
				startDate: this.nativeDateToMoment( newRange.from ),
				endDate: this.nativeDateToMoment( newRange.to ),
			};

			// For first date selection only: take a record of previous dates
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
		} );
	}

	dateToHumanReadable( date ) {
		return this.props.moment( date ).format( 'L' );
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
		this.setState( {
			oldStartDate: this.state.startDate, // update cached old dates
			oldEndDate: this.state.endDate, // update cached old dates
			oldDatesSaved: false,
		} );

		// Close the popover
		this.togglePopover();
	}

	renderDatePicker() {
		const now = new Date();

		return (
			<DatePicker
				className="media-library__date-range-popover-date-picker"
				enableOutsideDays={ false }
				toMonth={ now }
				onSelectDay={ this.onSelectDate }
				selectedDays={ {
					from: this.momentDateToNative( this.state.startDate ),
					to: this.momentDateToNative( this.state.endDate ),
				} }
				numberOfMonths={ 2 }
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
			<div className="media-library__date-range-popover-header">
				<Button
					className="media-library__date-range-popover-cancel-btn"
					onClick={ this.togglePopover }
					compact
				>
					Cancel
				</Button>
				<Button
					className="media-library__date-range-popover-apply-btn"
					primary
					onClick={ this.commitDates }
					compact
				>
					<Gridicon icon="checkmark" />
					Apply Dates
				</Button>
			</div>
		);
	}

	renderTriggerButton() {
		return (
			<Button
				className="media-library__date-range-btn"
				ref={ this.startButtonRef }
				onClick={ this.togglePopover }
				compact
			>
				<Gridicon className="media-library__date-range-icon" icon="calendar" />
				<span>
					{ this.dateToHumanReadable( this.state.startDate ) }
					-
					{ this.dateToHumanReadable( this.state.endDate ) }
				</span>
				<Gridicon icon="chevron-down" />
			</Button>
		);
	}

	renderPopover() {
		const popoverClassNames = classNames( {
			'media-library__date-range-popover': true,
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
				<div className="media-library__date-range-popover-inner">
					{ this.renderPopoverHeader() }
					{ this.renderDatePicker() }
				</div>
			</Popover>
		);
	}

	render() {
		const rootClassNames = classNames( {
			'media-library__date-range': true,
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

export default localize( MediaDateRange );
