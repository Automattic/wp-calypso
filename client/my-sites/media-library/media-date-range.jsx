/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import moment from 'moment';
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

class MediaDateRange extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			popoverVisible: false,
			oldStartDate: '',
			oldEndDate: '',
			startDate: moment().subtract( 1, 'months' ),
			endDate: moment(),
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
	}

	closePopover() {
		this.setState( {
			popoverVisible: false,
		} );
	}

	onSelectDate( date ) {
		const range = {
			from: this.state.startDate.toDate(),
			to: this.state.endDate.toDate(),
		};

		// Convert Moment to raw Date
		const rawDay = date.toDate();

		// Calculate the new Date range
		const newRange = DateUtils.addDayToRange( rawDay, range );

		// Edge case: Range can sometimes be from: null, to: null
		if ( ! newRange.from || ! newRange.to ) return;

		this.setState( previousState => {
			let newState = {
				startDate: moment( newRange.from ),
				endDate: moment( newRange.to ),
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

	formatDateForInput( date ) {
		return moment( date ).format( 'DD/MM/YYYY' );
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

		// Close the popover
		this.togglePopover();
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

	render() {
		const rootClassNames = classNames( {
			'media-library__date-range': true,
			'toggle-visible': this.state.popoverVisible,
		} );

		return (
			<div className={ rootClassNames }>
				<Button
					ref={ this.startButtonRef }
					onClick={ this.togglePopover }
					className="media-library__date-range-btn"
					compact
				>
					<Gridicon className="media-library__date-range-icon" icon="calendar" />
					<span>
						{ this.formatDateForInput( this.state.startDate ) }
						-
						{ this.formatDateForInput( this.state.endDate ) }
					</span>
					<Gridicon icon="chevron-down" />
				</Button>

				<Popover
					className="media-library__date-range-popover is-dialog-visible"
					isVisible={ this.state.popoverVisible }
					context={ this.startButtonRef.current }
					position="bottom"
					onClose={ this.revertDates }
				>
					<div className="media-library__date-range-popover-inner">
						<div className="media-library__date-range-popover-header">
							<Button onClick={ this.revertDates } compact>
								Cancel
							</Button>
							<Button primary onClick={ this.commitDates } compact>
								<Gridicon icon="checkmark" />
								Apply Dates
							</Button>
						</div>
						<DatePicker
							onSelectDay={ this.onSelectDate }
							selectedDays={ {
								from: this.state.startDate.toDate(),
								to: this.state.endDate.toDate(),
							} }
							numberOfMonths={ 2 }
							calendarViewDate={ this.state.startDate.toDate() }
							className="media-library__date-range-popover-date-picker"
							disabledDays={ [
								{
									after: new Date(), // you can't look at photos from the future!
								},
							] }
						/>
					</div>
				</Popover>
			</div>
		);
	}
}

export default MediaDateRange;
