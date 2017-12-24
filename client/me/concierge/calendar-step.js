/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize, moment } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CalendarCard from './calendar-card';
import CompactCard from 'components/card/compact';
import HeaderCake from 'components/header-cake';
import { getConciergeSignupForm } from 'state/selectors';
import { getCurrentUserId, getCurrentUserLocale } from 'state/current-user/selectors';
import { bookConciergeAppointment } from 'state/concierge/actions';
import {
	CONCIERGE_STATUS_BOOKING,
	CONCIERGE_STATUS_BOOKED,
	WPCOM_CONCIERGE_SCHEDULE_ID,
} from './constants';
import { isDefaultLocale } from 'lib/i18n-utils';

const NUMBER_OF_DAYS_TO_SHOW = 7;

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

class CalendarStep extends Component {
	static propTypes = {
		availableTimes: PropTypes.array.isRequired,
		onBack: PropTypes.func.isRequired,
		onComplete: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
	};

	onSubmit = timestamp => {
		const { signupForm } = this.props;
		const meta = {
			message: signupForm.message,
			timezone: signupForm.timezone,
		};

		this.props.bookConciergeAppointment(
			WPCOM_CONCIERGE_SCHEDULE_ID,
			timestamp,
			this.props.currentUserId,
			this.props.site.ID,
			meta
		);
	};

	componentWillUpdate( nextProps ) {
		if ( nextProps.signupForm.status === CONCIERGE_STATUS_BOOKED ) {
			// go to confirmation page if booking was successfull
			this.props.onComplete();
		}
	}

	render() {
		const { availableTimes, currentUserLocale, onBack, signupForm, translate } = this.props;
		const availability = groupAvailableTimesByDate( availableTimes, signupForm.timezone );

		return (
			<div>
				<HeaderCake onClick={ onBack }>{ translate( 'Choose Concierge Session' ) }</HeaderCake>
				<CompactCard>
					{ translate( 'Please select a day to have your Concierge session.' ) }
				</CompactCard>
				{ availability.map( ( { date, times } ) => (
					<CalendarCard
						date={ date }
						disabled={ signupForm.status === CONCIERGE_STATUS_BOOKING }
						isDefaultLocale={ isDefaultLocale( currentUserLocale ) }
						key={ date }
						onSubmit={ this.onSubmit }
						times={ times }
						timezone={ signupForm.timezone }
					/>
				) ) }
			</div>
		);
	}
}

export default connect(
	state => ( {
		signupForm: getConciergeSignupForm( state ),
		currentUserId: getCurrentUserId( state ),
		currentUserLocale: getCurrentUserLocale( state ),
	} ),
	{ bookConciergeAppointment }
)( localize( CalendarStep ) );
