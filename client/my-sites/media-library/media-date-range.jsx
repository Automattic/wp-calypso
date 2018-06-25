/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import moment from 'moment';
import { bindAll } from 'lodash';

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
			dateStartPopoverVisible: false,
			dateEndPopoverVisible: false,
			startDate: moment(),
			endDate: moment().add( 1, 'months' ),
		};

		bindAll( this, [
			'toggleStartPopover',
			'toggleEndPopover',
			'closeStartPopover',
			'closeEndPopover',
			'onSelectStartDate',
			'onSelectEndDate',
		] );

		this.startButtonRef = React.createRef();
		this.endButtonRef = React.createRef();
	}

	toggleStartPopover() {
		this.setState( {
			dateStartPopoverVisible: ! this.state.dateStartPopoverVisible,
		} );
	}

	toggleEndPopover() {
		this.setState( {
			dateEndPopoverVisible: ! this.state.dateEndPopoverVisible,
		} );
	}

	closeStartPopover() {
		this.setState( {
			dateStartPopoverVisible: false,
		} );
	}

	closeEndPopover() {
		this.setState( {
			dateEndPopoverVisible: false,
		} );
	}

	onSelectStartDate( date ) {
		this.setState( {
			startDate: date,
		} );
	}

	onSelectEndDate( date ) {
		this.setState( {
			endDate: date,
		} );
	}

	formatDateForInput( date ) {
		return moment( date ).format( 'MM/DD/YYYY' );
	}

	render() {
		return (
			<div className="media-library__date-range">
				<Button
					ref={ this.startButtonRef }
					onClick={ this.toggleStartPopover }
					className="media-library__date-range-btn"
					compact
				>
					<Gridicon className="media-library__date-range-icon" icon="calendar" />
					{ this.formatDateForInput( this.state.startDate ) }
				</Button>

				<Popover
					className="media-library__date-range-popover is-dialog-visible"
					isVisible={ this.state.dateStartPopoverVisible }
					context={ this.startButtonRef.current }
					position="bottom"
					onClose={ this.closeStartPopover }
				>
					<div className="media-library__date-range-popover-inner">
						<DatePicker
							selectedDay={ this.state.startDate }
							onSelectDay={ this.onSelectStartDate }
							disabledDays={ [
								{
									after: moment( this.state.endDate )
										.subtract( 1, 'days' )
										.toDate(),
								},
							] }
						/>
					</div>
				</Popover>

				<span className="media-library__date-range-span">to</span>

				<Button
					ref={ this.endButtonRef }
					onClick={ this.toggleEndPopover }
					className="media-library__date-range-btn"
					compact
				>
					<Gridicon className="media-library__date-range-icon" icon="calendar" />
					{ this.formatDateForInput( this.state.endDate ) }
				</Button>

				<Popover
					className="media-library__date-range-popover is-dialog-visible"
					isVisible={ this.state.dateEndPopoverVisible }
					context={ this.endButtonRef.current }
					position="bottom"
					onClose={ this.closeEndPopover }
				>
					<div className="media-library__date-range-popover-inner">
						<DatePicker
							selectedDay={ this.state.endDate }
							onSelectDay={ this.onSelectEndDate }
							calendarViewDate={ this.state.endDate.toDate() }
							disabledDays={ [
								{
									before: moment( this.state.startDate )
										.add( 1, 'days' )
										.toDate(),
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
