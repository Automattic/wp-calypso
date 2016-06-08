/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import InfoPopover from 'components/info-popover';
import viewport from 'lib/viewport';

/**
 * Local dependencies
 */
import utils from './utils';

/**
 * Globals
 */
const noop = () => {};

/**
 * Check if the given value is useful to use in time format
 * @param {String} value - time value to check
 * @return {String} checked value
 */
function checkTimeValue( value ) {
	if ( value !== '0' && value !== '00' && ( value[0] === '0' || Number( value ) > 99 ) ) {
		value = value.substr( 1 );
	}

	if ( ! ( isNaN( Number( value ) ) || Number( value ) < 0 || value.length > 2 ) ) {
		return value;
	}

	return false;
}

class PostScheduleClock extends Component {

	handleKeyDown( field, event ) {
		var operation = event.keyCode - 39,
			value = Number( event.target.value ),
			modifiers = this.getTimeValues();

		if ( ! ( -1 === operation || 1 === operation ) ) {
			return null;
		}

		value -= operation;

		if ( 'hour' === field ) {
			value = value > 23 ? 0 : value;
			value = value < 0 ? 23 : value;
		} else {
			value = value > 59 ? 0 : value;
			value = value < 0 ? 59 : value;
		}

		modifiers[ field ] = value;

		this.setTime( modifiers );
	}

	getTimeValues() {
		var modifiers = {},
			hour = checkTimeValue( this.refs.timeHourRef.value ),
			minute = checkTimeValue( this.refs.timeMinuteRef.value );

		if ( false !== hour && hour <= 24 ) {
			modifiers.hour = Number( hour );
		}

		if ( false !== minute && minute <= 59 ) {
			modifiers.minute = Number( minute );
		}

		return modifiers;
	}

	setTime( modifiers ) {
		let date = i18n.moment( this.props.date ).set( modifiers );
		this.props.onChange( date, modifiers );
	}

	render() {
		return (
			<div className="post-schedule__clock">
				<input
					className="post-schedule__clock_time"
					name="post-schedule__clock_hour"
					ref="timeHourRef"
					value={ this.props.date.format( 'HH' ) }
					onChange={ () => {
						this.setTime( this.getTimeValues() );
					} }
					onKeyDown={ this.handleKeyDown.bind( this, 'hour' ) }
					type="text" />

				<span className="post-schedule__clock-divisor">:</span>

				<input
					className="post-schedule__clock_time"
					name="post-schedule__clock_minute"
					ref="timeMinuteRef"
					value={ this.props.date.format( 'mm' ) }
					onChange={ () => {
						this.setTime( this.getTimeValues() );
					} }
					onKeyDown={ this.handleKeyDown.bind( this, 'minute' ) }
					type="text" />

				{ this.renderTimezoneBox() }
			</div>
		);
	}

	renderTimezoneBox() {
		if ( ! ( this.props.timezone || utils.isValidGMTOffset( this.props.gmtOffset ) ) ) {
			return;
		}

		let diffInHours, formatZ;

		if ( this.props.timezone ) {
			let tzDate = this.props.date.clone().tz( this.props.timezone );
			diffInHours = tzDate.utcOffset() - i18n.moment().utcOffset();
			formatZ = tzDate.format( ' Z ' );
		} else if ( utils.isValidGMTOffset( this.props.gmtOffset ) ) {
			let utcDate = this.props.date.clone().utcOffset( this.props.gmtOffset );
			diffInHours = utcDate.utcOffset() - i18n.moment().utcOffset();
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
						i18n.translate( 'Site %(diff)s from you', {
							args: { diff: diffInHours }
						} )
					}

					<InfoPopover
						className="post-schedule__timezone-info"
						position={ popoverPosition }
					>
						{ this.props.timezone
							? this.props.timezone.replace( /(\/)/ig, ' $1 ' )
							: 'UTC'
						}
						{ formatZ }
					</InfoPopover>
				</div>
			</span>
		);
	}
};

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

export default PostScheduleClock;
