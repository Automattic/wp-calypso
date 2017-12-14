/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize, moment } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import CalendarCard from './calendar-card';
import CompactCard from 'components/card/compact';
import HeaderCake from 'components/header-cake';

const NUMBER_OF_DAYS_TO_SHOW = 7;

const groupAvailableTimesByDate = availableTimes => {
	const dates = {};

	// Stub an object of { date: X, times: [] } for each day we care about
	for ( let x = 0; x < NUMBER_OF_DAYS_TO_SHOW; x++ ) {
		const startOfDay = moment()
			.startOf( 'day' )
			.add( x, 'days' )
			.valueOf();
		dates[ startOfDay ] = { date: startOfDay, times: [] };
	}

	// Go through all available times and bundle them into each date object
	availableTimes.forEach( ( { beginTimestamp } ) => {
		const startOfDay = moment( beginTimestamp )
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

class CalendarStep extends Component {
	static propTypes = {
		availableTimes: PropTypes.arrayOf(
			PropTypes.shape( { beginTimestamp: PropTypes.number.isRequired } )
		).isRequired,
		onBack: PropTypes.func.isRequired,
		onComplete: PropTypes.func.isRequired,
	};

	render() {
		const { availableTimes, translate } = this.props;
		const availability = groupAvailableTimesByDate( availableTimes );

		return (
			<div>
				<HeaderCake onClick={ this.props.onBack }>
					{ translate( 'Choose Concierge Session' ) }
				</HeaderCake>
				<CompactCard>
					{ translate( 'Please select a day to have your Concierge session.' ) }
				</CompactCard>
				{ availability.map( ( { date, times } ) => (
					<CalendarCard
						date={ date }
						times={ times }
						onSubmit={ this.props.onComplete }
						key={ date }
					/>
				) ) }
			</div>
		);
	}
}

export default localize( CalendarStep );
