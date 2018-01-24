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
import QueryConciergeAppointmentDetails from 'components/data/query-concierge-appointment-details';
import { getConciergeAppointmentDetails, getConciergeSignupForm } from 'state/selectors';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { rescheduleConciergeAppointment } from 'state/concierge/actions';
import AvailableTimePicker from '../shared/available-time-picker';
import {
	CONCIERGE_STATUS_BOOKING,
	CONCIERGE_STATUS_BOOKED,
	WPCOM_CONCIERGE_SCHEDULE_ID,
} from '../constants';
import { recordTracksEvent } from 'state/analytics/actions';

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

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_reschedule_calendar_step' );
	}

	componentWillUpdate( nextProps ) {
		if ( nextProps.signupForm.status === CONCIERGE_STATUS_BOOKED ) {
			// go to confirmation page if booking was successful
			this.props.onComplete();
		}
	}

	render() {
		const {
			appointmentId,
			appointmentDetails,
			availableTimes,
			currentUserLocale,
			signupForm,
			site,
			translate,
		} = this.props;

		return (
			<div>
				<QueryConciergeAppointmentDetails
					appointmentId={ appointmentId }
					scheduleId={ WPCOM_CONCIERGE_SCHEDULE_ID }
				/>

				<AvailableTimePicker
					actionText={ translate( 'Reschedule to this date' ) }
					availableTimes={ availableTimes }
					currentUserLocale={ currentUserLocale }
					disabled={ signupForm.status === CONCIERGE_STATUS_BOOKING || ! appointmentDetails }
					description={ translate( 'Please select a day to reschedule your Concierge session.' ) }
					onBack={ null }
					onSubmit={ this.onSubmit }
					site={ site }
					signupForm={ signupForm }
				/>
			</div>
		);
	}
}

export default connect(
	state => ( {
		appointmentDetails: getConciergeAppointmentDetails( state ),
		currentUserLocale: getCurrentUserLocale( state ),
		signupForm: getConciergeSignupForm( state ),
	} ),
	{ recordTracksEvent, rescheduleConciergeAppointment }
)( localize( CalendarStep ) );
