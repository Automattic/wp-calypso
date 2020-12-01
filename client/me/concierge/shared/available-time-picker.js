/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment-timezone';

/**
 * Internal dependencies
 */
import AvailableTimeCard from './available-time-card';
import { isDefaultLocale } from 'calypso/lib/i18n-utils';

const groupAvailableTimesByDate = ( availableTimes, timezone ) => {
	const dates = {};

	// Go through all available times and bundle them into each date object
	availableTimes.forEach( ( beginTimestamp ) => {
		const startOfDay = moment( beginTimestamp ).tz( timezone ).startOf( 'day' ).valueOf();
		const beginHour = moment.tz( beginTimestamp, timezone ).format( 'HH' );
		const isMorning = beginHour < 12;

		if ( dates.hasOwnProperty( startOfDay ) ) {
			dates[ startOfDay ].times.push( beginTimestamp );
			isMorning
				? dates[ startOfDay ].morningTimes.push( beginTimestamp )
				: dates[ startOfDay ].eveningTimes.push( beginTimestamp );
		} else {
			const morningTimes = isMorning ? [ beginTimestamp ] : [];
			const eveningTimes = isMorning ? [] : [ beginTimestamp ];

			dates[ startOfDay ] = {
				date: startOfDay,
				times: [ beginTimestamp ],
				morningTimes,
				eveningTimes,
			};
		}
	} );

	// Convert the dates object into an array sorted by date and return it
	return Object.keys( dates )
		.sort()
		.map( ( date ) => dates[ date ] );
};

class AvailableTimePicker extends Component {
	static propTypes = {
		actionText: PropTypes.string.isRequired,
		availableTimes: PropTypes.array.isRequired,
		appointmentTimespan: PropTypes.number.isRequired,
		onSubmit: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
		timezone: PropTypes.string.isRequired,
	};

	render() {
		const {
			actionText,
			availableTimes,
			appointmentTimespan,
			currentUserLocale,
			disabled,
			onSubmit,
			timezone,
		} = this.props;
		const availability = groupAvailableTimesByDate( availableTimes, timezone );

		return (
			<div>
				{ availability.map( ( { date, times, morningTimes, eveningTimes } ) => (
					<AvailableTimeCard
						actionText={ actionText }
						appointmentTimespan={ appointmentTimespan }
						date={ date }
						disabled={ disabled }
						isDefaultLocale={ isDefaultLocale( currentUserLocale ) }
						key={ date }
						onSubmit={ onSubmit }
						times={ times }
						morningTimes={ morningTimes }
						eveningTimes={ eveningTimes }
						timezone={ timezone }
					/>
				) ) }
			</div>
		);
	}
}

export default AvailableTimePicker;
