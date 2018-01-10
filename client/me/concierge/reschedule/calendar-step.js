/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getConciergeSignupForm } from 'state/selectors';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { rescheduleConciergeAppointment } from 'state/concierge/actions';
import CalendarPage from '../shared/calendar-page';
import {
	CONCIERGE_STATUS_BOOKING,
	CONCIERGE_STATUS_BOOKED,
	WPCOM_CONCIERGE_SCHEDULE_ID,
} from '../constants';

class CalendarStep extends Component {
	static propTypes = {
		appointmentId: PropTypes.string.isRequired,
		availableTimes: PropTypes.array.isRequired,
		currentUserLocale: PropTypes.string.isRequired,
		onComplete: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
		signupForm: PropTypes.object.isRequired,
	};

	onSubmit = timestamp => {
		const { appointmentId } = this.props;

		this.props.rescheduleConciergeAppointment(
			WPCOM_CONCIERGE_SCHEDULE_ID,
			appointmentId,
			timestamp
		);
	};

	componentWillUpdate( nextProps ) {
		if ( nextProps.signupForm.status === CONCIERGE_STATUS_BOOKED ) {
			// go to confirmation page if booking was successfull
			this.props.onComplete();
		}
	}

	render() {
		const { availableTimes, currentUserLocale, signupForm, site, translate } = this.props;

		return (
			<CalendarPage
				actionText={ translate( 'Reschedule to this date' ) }
				availableTimes={ availableTimes }
				currentUserLocale={ currentUserLocale }
				disabled={ signupForm.status === CONCIERGE_STATUS_BOOKING }
				description={ translate( 'Please select a day to reschedule your Concierge session.' ) }
				onBack={ null }
				onSubmit={ this.onSubmit }
				site={ site }
				signupForm={ signupForm }
			/>
		);
	}
}

export default connect(
	state => ( {
		signupForm: getConciergeSignupForm( state ),
		currentUserLocale: getCurrentUserLocale( state ),
	} ),
	{ rescheduleConciergeAppointment }
)( localize( CalendarStep ) );
