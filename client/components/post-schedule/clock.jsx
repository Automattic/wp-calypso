/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize, moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import InfoPopover from 'components/info-popover';
import viewport from 'lib/viewport';

/**
 * Local dependencies
 */
import {
	isValidGMTOffset,
	parseAndValidateNumber
} from './utils';

/**
 * Globals
 */
const noop = () => {};

class PostScheduleClock extends Component {
	constructor() {
		super( ...arguments );

		// bounds
		this.adjustHour = event => this.handleKeyDown( event, 'hour' );
		this.adjustMinute = event => this.handleKeyDown( event, 'minute' );
	}

	handleKeyDown( event, field ) {
		const operation = event.keyCode - 39;
		const modifiers = this.getTimeValues();

		if ( ! ( -1 === operation || 1 === operation ) ) {
			return null;
		}

		let value = Number( event.target.value ) - operation;

		if ( 'hour' === field ) {
			value = value > 23 ? 0 : value;
			value = value < 0 ? 23 : value;
		} else {
			value = value > 59 ? 0 : value;
			value = value < 0 ? 59 : value;
		}

		modifiers[ field ] = value;

		this.setTime( event, modifiers );
	}

	getTimeValues() {
		const {
			hourReference,
			minuteRef
		} = this.refs;

		const hour = parseAndValidateNumber( hourReference.value );
		const minute = parseAndValidateNumber( minuteRef.value );
		const modifiers = {};

		if ( false !== hour && hour < 24 ) {
			modifiers.hour = Number( hour );
		}

		if ( false !== minute && minute <= 59 ) {
			modifiers.minute = Number( minute );
		}

		return modifiers;
	}

	setTime = ( event, modifiers = this.getTimeValues() ) => {
		const date = moment( this.props.date ).set( modifiers );
		this.props.onChange( date, modifiers );
	}

	renderTimezoneBox() {
		const {
			date,
			gmtOffset,
			timezone,
			translate
		} = this.props;

		if ( ! ( timezone || isValidGMTOffset( gmtOffset ) ) ) {
			return;
		}

		let diffInHours, formatZ;

		if ( timezone ) {
			const tzDate = date.clone().tz( timezone );
			diffInHours = tzDate.utcOffset() - moment().utcOffset();
			formatZ = tzDate.format( ' Z ' );
		} else if ( isValidGMTOffset( gmtOffset ) ) {
			const utcDate = date.clone().utcOffset( gmtOffset );
			diffInHours = utcDate.utcOffset() - moment().utcOffset();
			formatZ = utcDate.format( ' Z ' );
		}

		if ( ! diffInHours ) {
			return;
		}

		diffInHours = diffInHours / 60;
		diffInHours = Math.round( diffInHours * 100 ) / 100;
		diffInHours = ( diffInHours > 0 ? '+' : '' ) + diffInHours + 'h';

		const popoverPosition = viewport.isMobile() ? 'top' : 'right';

		return (
			<span>
				<div className="post-schedule__clock-timezone">
					{
						translate( 'Site %(diff)s from you', {
							args: { diff: diffInHours }
						} )
					}

					<InfoPopover
						className="post-schedule__timezone-info"
						position={ popoverPosition }
					>
						{ timezone
							? timezone.replace( /(\/)/ig, ' $1 ' )
							: 'UTC'
						}
						{ formatZ }
					</InfoPopover>
				</div>
			</span>
		);
	}

	render() {
		const { date } = this.props;

		return (
			<div className="post-schedule__clock">
				<input
					className="post-schedule__clock-time"
					name="post-schedule__clock_hour"
					ref="hourReference"
					value={ date.format( 'HH' ) }
					onChange={ this.setTime }
					onKeyDown={ this.adjustHour }
					type="text" />

				<span className="post-schedule__clock-divisor">:</span>

				<input
					className="post-schedule__clock-time"
					name="post-schedule__clock_minute"
					ref="minuteRef"
					value={ date.format( 'mm' ) }
					onChange={ this.setTime }
					onKeyDown={ this.adjustMinute }
					type="text" />

				{ this.renderTimezoneBox() }
			</div>
		);
	}
}

/**
 * Statics
 */
PostScheduleClock.propTypes = {
	date: PropTypes.object.isRequired,
	timezone: PropTypes.string,
	gmtOffset: PropTypes.number,
	onChange: PropTypes.func
};

PostScheduleClock.defaultProps = {
	onChange: noop
};

export default localize( PostScheduleClock );
