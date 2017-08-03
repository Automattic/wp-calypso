/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize, moment } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import ControlItem from 'components/segmented-control/item';
import InfoPopover from 'components/info-popover';
import { getSiteSetting } from 'state/selectors';
import SegmentedControl from 'components/segmented-control';
import viewport from 'lib/viewport';

/**
 * Local dependencies
 */
import {
	is12hr,
	isValidGMTOffset,
	parseAndValidateNumber,
	convertHoursToHHMM,
	convertMinutesToHHMM,
} from './utils';

class PostScheduleClock extends Component {
	constructor() {
		super( ...arguments );

		// bounds
		this.adjustHour = event => this.handleKeyDown( event, 'hour' );
		this.adjustMinute = event => this.handleKeyDown( event, 'minute' );

		this.setAm = ( event ) => this.setAmPm( event, 'AM' );
		this.setPm = ( event ) => this.setAmPm( event, 'PM' );
	}

	handleKeyDown( event, field ) {
		const operation = event.keyCode - 39;
		const modifiers = this.getTimeValues();

		if ( ! ( -1 === operation || 1 === operation ) ) {
			return null;
		}

		let value = Number( event.target.value );

		if ( 'hour' === field ) {
			if ( this.props.is12hour && this.refs.amPmReference ) {
				value = this.convertTo24Hour( value );
			}

			value = value - operation;
			value = value > 23 ? 0 : value;
			value = value < 0 ? 23 : value;
		} else {
			value -= operation;

			value = value > 59 ? 0 : value;
			value = value < 0 ? 59 : value;
		}

		modifiers[ field ] = value;

		this.setTime( event, modifiers );
	}

	getTimeValues() {
		const {
			amPmReference,
			hourReference,
			minuteRef
		} = this.refs;

		const modifiers = {};
		const hour = parseAndValidateNumber( hourReference.value );
		let minute = parseAndValidateNumber( minuteRef.value );

		if ( false !== hour && hour < 24 ) {
			modifiers.hour = Number( hour );
		}

		if ( this.props.is12hour && amPmReference ) {
			if ( 'undefined' === typeof modifiers.hour || ( 'PM' === amPmReference.value && modifiers.hour > 12 ) ) {
				modifiers.hour = Number( hourReference.value.substr( -1 ) );
			}

			modifiers.hour = this.convertTo24Hour( modifiers.hour );
		}

		if ( false !== minute ) {
			if ( minute > 60 ) {
				minute = minuteRef.value.substr( -1 );
			}

			modifiers.minute = Number( minute );
		}

		return modifiers;
	}

	setTime = ( event, modifiers = this.getTimeValues() ) => {
		const date = moment( this.props.date ).set( modifiers );
		this.props.onChange( date, modifiers );
	};

	setAmPm( event, amOrPm ) {
		this.refs.amPmReference.value = amOrPm;
		this.setTime( event );
	}

	/**
	 * Converts a 12-hour time to a 24-hour time, depending on time format.
	 *
	 * @param {Number}  hour The hour to convert.
	 * @return {Number}      The converted hour.
	 */
	convertTo24Hour( hour ) {
		if ( 'PM' === this.refs.amPmReference.value && hour < 12 ) {
			hour += 12;
		} else if ( 'AM' === this.refs.amPmReference.value && 12 === hour ) {
			hour = 0;
		}

		return hour;
	}

	renderTimezoneSection() {
		const {
			date,
			gmtOffset,
			siteId,
			siteSlug,
			timezone,
			translate
		} = this.props;

		if ( ! ( timezone || isValidGMTOffset( gmtOffset ) ) ) {
			return;
		}

		let diffInMinutes, tzDateOffset;

		if ( timezone ) {
			const tzDate = date.clone().tz( timezone );
			tzDateOffset = tzDate.format( 'Z' );
			diffInMinutes = tzDate.utcOffset() - moment( date ).utcOffset();
		} else if ( isValidGMTOffset( gmtOffset ) ) {
			const utcDate = date.clone().utcOffset( gmtOffset );
			diffInMinutes = utcDate.utcOffset() - moment().utcOffset();
		}

		if ( ! diffInMinutes ) {
			return;
		}

		const popoverPosition = viewport.isMobile() ? 'top' : 'right';
		const timezoneText = timezone
			? `${ timezone.replace( /\_/ig, ' ' ) } ${ tzDateOffset }`
			: `UTC${ convertHoursToHHMM( gmtOffset ) }`;

		const timezoneInfo = translate(
			'This site timezone (%(timezoneText)s) will be used for publishing. ' +
			'You can change it in {{a}}General Settings{{/a}}.', {
				args: { timezoneText },
				components: {
					a: <a href={ `/settings/general/${ siteSlug || siteId }` } />
				}
			}
		);

		return (
			<span>
				<div className="post-schedule__clock-timezone">
					{
						translate( 'This site timezone is %(diff)sh from your local timezone.', {
							args: { diff: convertMinutesToHHMM( diffInMinutes ) }
						} )
					}

					<InfoPopover
						className="post-schedule__timezone-info"
						position={ popoverPosition }
					>
						{ timezoneInfo }
					</InfoPopover>
				</div>
			</span>
		);
	}

	render() {
		const { date, is12hour, translate } = this.props;

		return (
			<div className="post-schedule__clock">
				<input
					className="post-schedule__clock-time"
					name="post-schedule__clock_hour"
					ref="hourReference"
					value={ date.format( is12hour ? 'hh' : 'HH' ) }
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

				{ is12hour && (
					<span>
						<input type="hidden" ref="amPmReference" name="post-schedule__clock_am-pm" value={ date.format( 'A' ) } />
						<SegmentedControl compact>
							<ControlItem value="am" onClick={ this.setAm } selected={ 'AM' === date.format( 'A' ) }>
								{ translate( 'AM' ) }
							</ControlItem>
							<ControlItem value="pm" onClick={ this.setPm } selected={ 'PM' === date.format( 'A' ) }>
								{ translate( 'PM' ) }
							</ControlItem>
						</SegmentedControl>
					</span>
				) }

				{ this.renderTimezoneSection() }
			</div>
		);
	}
}

PostScheduleClock.propTypes = {
	date: PropTypes.object.isRequired,
	timezone: PropTypes.string,
	gmtOffset: PropTypes.number,
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	onChange: PropTypes.func
};

PostScheduleClock.defaultProps = {
	onChange: noop
};

export default connect(
	( state, { siteId } ) => ( {
		is12hour: is12hr( getSiteSetting( state, siteId, 'time_format' ) ),
	} ),
)( localize( PostScheduleClock ) ) ;
