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
	parseAndValidateNumber,
	convertHoursToHHMM,
	convertMinutesToHHMM,
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
			diffInMinutes = tzDate.utcOffset() - moment().utcOffset();
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

export default localize( PostScheduleClock );
