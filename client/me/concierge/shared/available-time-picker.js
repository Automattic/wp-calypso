/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AvailableTimeCard from './available-time-card';
import { isDefaultLocale } from 'lib/i18n-utils';

const NUMBER_OF_DAYS_TO_SHOW = 10;

const groupAvailableTimesByDate = ( availableTimes, timezone ) => {
	const dates = {};

	// Stub an object of { date: X, times: [] } for each day we care about
	for ( let x = 0; x < NUMBER_OF_DAYS_TO_SHOW; x++ ) {
		const startOfDay = moment()
			.tz( timezone )
			.startOf( 'day' )
			.add( x, 'days' )
			.valueOf();
		dates[ startOfDay ] = { date: startOfDay, times: [] };
	}

	// Go through all available times and bundle them into each date object
	availableTimes.forEach( beginTimestamp => {
		const startOfDay = moment( beginTimestamp )
			.tz( timezone )
			.startOf( 'day' )
			.valueOf();
		if ( dates.hasOwnProperty( startOfDay ) ) {
			dates[ startOfDay ].times.push( beginTimestamp );
		}
	} );

	// Convert the dates object into an array sorted by date and return it
	return Object.keys( dates )
		.sort()
		.map( date => dates[ date ] );
};

class AvailableTimePicker extends Component {
	static propTypes = {
		actionText: PropTypes.string.isRequired,
		availableTimes: PropTypes.array.isRequired,
		onSubmit: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
		timezone: PropTypes.string.isRequired,
	};

	render() {
		const {
			actionText,
			availableTimes,
			currentUserLocale,
			disabled,
			onSubmit,
			timezone,
		} = this.props;
		const availability = groupAvailableTimesByDate( availableTimes, timezone );

		return (
			<div>
				{ availability.map( ( { date, times } ) => (
					<AvailableTimeCard
						actionText={ actionText }
						date={ date }
						disabled={ disabled }
						isDefaultLocale={ isDefaultLocale( currentUserLocale ) }
						key={ date }
						onSubmit={ onSubmit }
						times={ times }
						timezone={ timezone }
					/>
				) ) }
			</div>
		);
	}
}

export default AvailableTimePicker;
