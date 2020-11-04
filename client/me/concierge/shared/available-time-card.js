/**
 * CalendarCard represents a day of schedulable concierge chats. Each card is expandable to
 * allow the user to select a specific time on the day. If the day has no availability, it will
 * not be expandable. When you stack a group of these cards together you'll get the scheduling
 * calendar view.
 */

/**
 * External dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import config from 'calypso/config';
import 'moment-timezone'; // monkey patches the existing moment.js
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FoldableCard from 'calypso/components/foldable-card';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { getLanguage } from 'calypso/lib/i18n-utils';
import SelectOptGroups from 'calypso/components/forms/select-opt-groups';
import day from 'calypso/assets/images/quick-start/day.svg';
import night from 'calypso/assets/images/quick-start/night.svg';

const defaultLanguage = getLanguage( config( 'i18n_default_locale_slug' ) ).name;

class CalendarCard extends Component {
	static propTypes = {
		actionText: PropTypes.string.isRequired,
		date: PropTypes.number.isRequired,
		disabled: PropTypes.bool.isRequired,
		isDefaultLocale: PropTypes.bool.isRequired,
		onSubmit: PropTypes.func.isRequired,
		times: PropTypes.arrayOf( PropTypes.number ).isRequired,
		timezone: PropTypes.string.isRequired,
	};

	constructor( props ) {
		super( props );

		let closestTimestamp;

		const { moment, times, morningTimes, eveningTimes, date } = this.props;

		// If there are times passed in, pick a sensible default.
		if ( Array.isArray( times ) && ! isEmpty( times ) ) {
			// To find the best default time for the time picker, we're going to pick the time that's
			// closest to the current time of day. To do this first we find out how many seconds it's
			// been since midnight on the current real world day...
			const millisecondsSinceMidnight = moment().diff( this.withTimezone().startOf( 'day' ) );

			// Then we'll use that to find the same time of day on the Card's given date. This will be the
			// target timestamp we're trying to get as close to as possible.
			const targetTimestamp = this.withTimezone( date )
				.startOf( 'day' )
				.add( millisecondsSinceMidnight );

			// Default to the first timestamp and calculate how many seconds it's offset from the target
			closestTimestamp = times[ 0 ];
			let closestTimeOffset = Math.abs( closestTimestamp - targetTimestamp );

			// Then look through all timestamps to find which one is the closest to the target
			times.forEach( ( time ) => {
				const offset = Math.abs( time - targetTimestamp );
				if ( offset < closestTimeOffset ) {
					closestTimestamp = time;
					closestTimeOffset = offset;
				}
			} );
		}

		let selectedTimeGroup, selectedMorningTime, selectedEveningTime;
		if ( morningTimes.includes( closestTimestamp ) ) {
			selectedTimeGroup = 'morning';
			selectedMorningTime = closestTimestamp;
			selectedEveningTime = eveningTimes[ 0 ];
		} else {
			selectedTimeGroup = 'evening';
			selectedEveningTime = closestTimestamp;
			selectedMorningTime = morningTimes[ morningTimes.length - 1 ];
		}

		this.state = {
			selectedTimeGroup,
			selectedMorningTime,
			selectedEveningTime,
		};
	}

	withTimezone( dateTime ) {
		const { moment, timezone } = this.props;
		return moment( dateTime ).tz( timezone );
	}

	formatTimeDisplay( time ) {
		const timeWithoutTz = this.withTimezone( time ).format( 'LT' );
		const timeWithTz = this.withTimezone( time ).format( 'LT z' );
		const timezone = this.withTimezone( time ).format( 'z' );

		if ( [ '12:00 AM', '00:00' ].includes( timeWithoutTz ) ) {
			return this.props.translate( 'midnight %(timezone)s', {
				args: { timezone },
				comment: 'This is a time of day value shown in the dropdown',
			} );
		}

		return timeWithTz;
	}

	getSelectOptGroup( times ) {
		const { translate } = this.props;

		const earlyMorningOptGroup = {
			label: translate( 'Early Morning' ),
			options: [],
			isEarlyMorningTime: ( hour ) => hour >= 0 && hour < 6,
		};
		const morningOptGroup = {
			label: translate( 'Morning' ),
			options: [],
			isMorningTime: ( hour ) => hour >= 6 && hour < 12,
		};
		const afternoonOptGroup = {
			label: translate( 'Afternoon' ),
			options: [],
			isAfternoonTime: ( hour ) => hour >= 12 && hour < 18,
		};
		const eveningOptGroup = {
			label: translate( 'Evening' ),
			options: [],
		};

		times.map( ( time ) => {
			const hour = this.withTimezone( time ).format( 'HH' );

			if ( earlyMorningOptGroup.isEarlyMorningTime( hour ) ) {
				earlyMorningOptGroup.options.push( {
					label: this.formatTimeDisplay( time ),
					value: time,
				} );
			} else if ( morningOptGroup.isMorningTime( hour ) ) {
				morningOptGroup.options.push( {
					label: this.formatTimeDisplay( time ),
					value: time,
				} );
			} else if ( afternoonOptGroup.isAfternoonTime( hour ) ) {
				afternoonOptGroup.options.push( {
					label: this.formatTimeDisplay( time ),
					value: time,
				} );
			} else {
				eveningOptGroup.options.push( {
					label: this.formatTimeDisplay( time ),
					value: time,
				} );
			}
		} );

		const options = [
			earlyMorningOptGroup,
			morningOptGroup,
			afternoonOptGroup,
			eveningOptGroup,
		].filter( ( optGroup ) => optGroup.options.length > 0 );

		return options;
	}

	/**
	 * Returns a string representing the day of the week, with certain dates using natural
	 * language like "Today" or "Tomorrow" instead of the name of the day.
	 *
	 * @param {number} date Timestamp of the date
	 * @returns {string} The name for the day of the week
	 */
	getDayOfWeekString( date ) {
		const { translate } = this.props;
		const today = this.withTimezone().startOf( 'day' );
		const dayOffset = today.diff( date.startOf( 'day' ), 'days' );

		switch ( dayOffset ) {
			case 0:
				return translate( 'Today' );
			case -1:
				return translate( 'Tomorrow' );
		}
		return date.format( 'dddd' );
	}

	renderHeader() {
		// The "Header" is that part of the foldable card that you click on to expand it.
		const date = this.withTimezone( this.props.date );

		return (
			<div className="shared__available-time-card-header">
				<Gridicon icon="calendar" className="shared__available-time-card-header-icon" />
				<span>
					<b>{ this.getDayOfWeekString( date ) } —</b> { date.format( ' MMMM D' ) }
				</span>
			</div>
		);
	}

	onChange = ( { target } ) => {
		const key =
			this.state.selectedTimeGroup === 'morning' ? 'selectedMorningTime' : 'selectedEveningTime';
		this.setState( { [ key ]: target.value } );
	};

	submitForm = () => {
		const selectedTime =
			this.state.selectedTimeGroup === 'morning'
				? this.state.selectedMorningTime
				: this.state.selectedEveningTime;
		this.props.onSubmit( selectedTime );
	};

	handleFilterClick = ( timeGroup ) => {
		this.setState( { selectedTimeGroup: timeGroup } );
	};

	render() {
		const {
			actionText,
			disabled,
			isDefaultLocale,
			times,
			translate,
			morningTimes,
			eveningTimes,
			// Temporarily harcoding durationInMinutes
			// appointmentTimespan,
			// moment,
		} = this.props;

		// Temporarily hardcoded to 30mins.
		const durationInMinutes = 30; // moment.duration( appointmentTimespan, 'seconds' ).minutes();

		const description = isDefaultLocale
			? translate( 'Sessions are %(durationInMinutes)d minutes long.', {
					args: { durationInMinutes },
			  } )
			: translate( 'Sessions are %(durationInMinutes)d minutes long and in %(defaultLanguage)s.', {
					args: { defaultLanguage, durationInMinutes },
			  } );

		const isMorningTimeGroupSelected = this.state.selectedTimeGroup === 'morning';
		let timesForTimeGroup,
			btnMorningTitle,
			btnEveningTitle,
			btnMorningTimeGroup = 'shared__time-group',
			btnEveningTimeGroup = 'shared__time-group';

		if ( isMorningTimeGroupSelected ) {
			timesForTimeGroup = morningTimes;
			btnMorningTimeGroup = classnames( 'shared__time-group', {
				'is-selected': isMorningTimeGroupSelected,
			} );
			btnEveningTitle =
				eveningTimes.length === 0 ? translate( 'No afternoon slots available' ) : '';
		} else {
			timesForTimeGroup = eveningTimes;
			btnEveningTimeGroup = classnames( 'shared__time-group', {
				'is-selected': ! isMorningTimeGroupSelected,
			} );
			btnMorningTitle = morningTimes.length === 0 ? translate( 'No morning slots available' ) : '';
		}

		return (
			<FoldableCard
				className="shared__available-time-card"
				clickableHeader={ ! isEmpty( times ) }
				compact
				disabled={ isEmpty( times ) }
				summary={ isEmpty( times ) ? translate( 'No sessions available' ) : null }
				header={ this.renderHeader() }
			>
				<FormFieldset>
					<FormLabel htmlFor="concierge-start-time-group">
						{ translate( 'Choose time of day' ) }
					</FormLabel>
					<Button
						className={ btnMorningTimeGroup }
						onClick={ () => this.handleFilterClick( 'morning' ) }
						disabled={ morningTimes.length === 0 }
						title={ btnMorningTitle }
					>
						<div className="shared__time-group-filter">
							<img src={ day } alt="" />
							{ translate( 'Morning' ) }
						</div>
					</Button>
					<Button
						className={ btnEveningTimeGroup }
						onClick={ () => this.handleFilterClick( 'evening' ) }
						disabled={ eveningTimes.length === 0 }
						title={ btnEveningTitle }
					>
						<div className="shared__time-group-filter">
							<img src={ night } alt="" />
							<span>{ translate( 'Afternoon' ) }</span>
						</div>
					</Button>
					<br />
					<br />
					{ timesForTimeGroup.length > 0 && (
						<>
							<FormLabel htmlFor="concierge-start-time">
								{ translate( 'Choose a starting time' ) }
							</FormLabel>
							<SelectOptGroups
								name="concierge-time-groups"
								optGroups={ this.getSelectOptGroup( timesForTimeGroup ) }
								id="concierge-start-time"
								disabled={ disabled }
								onChange={ this.onChange }
								value={
									isMorningTimeGroupSelected
										? this.state.selectedMorningTime
										: this.state.selectedEveningTime
								}
							/>
							<FormSettingExplanation>{ description }</FormSettingExplanation>
						</>
					) }
				</FormFieldset>

				{ timesForTimeGroup.length > 0 && (
					<FormFieldset>
						<Button disabled={ disabled } primary onClick={ this.submitForm }>
							{ actionText }
						</Button>
					</FormFieldset>
				) }
			</FoldableCard>
		);
	}
}

export default localize( withLocalizedMoment( CalendarCard ) );
