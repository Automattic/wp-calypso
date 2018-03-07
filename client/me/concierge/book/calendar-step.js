/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import CompactCard from 'components/card/compact';
import { getConciergeSignupForm } from 'state/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { bookConciergeAppointment, requestConciergeAvailableTimes } from 'state/concierge/actions';
import AvailableTimePicker from '../shared/available-time-picker';
import {
	CONCIERGE_STATUS_BOOKED,
	CONCIERGE_STATUS_BOOKING,
	CONCIERGE_STATUS_BOOKING_ERROR,
	WPCOM_CONCIERGE_SCHEDULE_ID,
} from '../constants';
import { recordTracksEvent } from 'state/analytics/actions';

class CalendarStep extends Component {
	static propTypes = {
		availableTimes: PropTypes.array.isRequired,
		currentUserId: PropTypes.number.isRequired,
		onBack: PropTypes.func.isRequired,
		onComplete: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
		signupForm: PropTypes.object.isRequired,
	};

	onSubmit = timestamp => {
		const { currentUserId, signupForm, site } = this.props;
		const meta = {
			firstname: signupForm.firstname,
			lastname: signupForm.lastname,
			message: signupForm.message,
			timezone: signupForm.timezone,
		};

		this.props.bookConciergeAppointment(
			WPCOM_CONCIERGE_SCHEDULE_ID,
			timestamp,
			currentUserId,
			site.ID,
			meta
		);
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_book_calendar_step' );
	}

	componentWillUpdate( nextProps ) {
		if ( nextProps.signupForm.status === CONCIERGE_STATUS_BOOKED ) {
			// go to confirmation page if booking was successfull
			this.props.onComplete();
		} else if ( nextProps.signupForm.status === CONCIERGE_STATUS_BOOKING_ERROR ) {
			// request new available times
			this.props.requestConciergeAvailableTimes( WPCOM_CONCIERGE_SCHEDULE_ID );
		}
	}

	render() {
		const { availableTimes, onBack, signupForm, site } = this.props;

		return (
			<div>
				<HeaderCake onClick={ onBack }>Choose Concierge Session</HeaderCake>
				<CompactCard>Please select a day to have your Concierge session.</CompactCard>

				<AvailableTimePicker
					actionText={ 'Book this session' }
					availableTimes={ availableTimes }
					disabled={ signupForm.status === CONCIERGE_STATUS_BOOKING }
					onSubmit={ this.onSubmit }
					site={ site }
					timezone={ signupForm.timezone }
				/>
			</div>
		);
	}
}

export default connect(
	state => ( {
		currentUserId: getCurrentUserId( state ),
		signupForm: getConciergeSignupForm( state ),
	} ),
	{ bookConciergeAppointment, recordTracksEvent, requestConciergeAvailableTimes }
)( CalendarStep );
