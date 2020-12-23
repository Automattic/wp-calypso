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
import HeaderCake from 'calypso/components/header-cake';
import { CompactCard } from '@automattic/components';
import getConciergeSignupForm from 'calypso/state/selectors/get-concierge-signup-form';
import getConciergeScheduleId from 'calypso/state/selectors/get-concierge-schedule-id';
import getConciergeAppointmentTimespan from 'calypso/state/selectors/get-concierge-appointment-timespan';
import { getCurrentUserId, getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { bookConciergeAppointment, requestConciergeInitial } from 'calypso/state/concierge/actions';
import AvailableTimePicker from '../shared/available-time-picker';
import {
	CONCIERGE_STATUS_BOOKED,
	CONCIERGE_STATUS_BOOKING,
	CONCIERGE_STATUS_BOOKING_ERROR,
} from '../constants';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';
import FormattedHeader from 'calypso/components/formatted-header';

class CalendarStep extends Component {
	static propTypes = {
		availableTimes: PropTypes.array.isRequired,
		appointmentTimespan: PropTypes.number.isRequired,
		currentUserId: PropTypes.number.isRequired,
		currentUserLocale: PropTypes.string.isRequired,
		onBack: PropTypes.func.isRequired,
		onComplete: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
		signupForm: PropTypes.object.isRequired,
		scheduleId: PropTypes.number.isRequired,
	};

	onSubmit = ( timestamp ) => {
		const { currentUserId, signupForm, site, scheduleId } = this.props;
		const meta = {
			firstname: signupForm.firstname,
			lastname: signupForm.lastname,
			message: signupForm.message,
			timezone: signupForm.timezone,
			isRebrandCitiesSite: signupForm.isRebrandCitiesSite,
			phoneNumber: signupForm.phoneNumber,
		};

		this.props.bookConciergeAppointment( scheduleId, timestamp, currentUserId, site.ID, meta );
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_book_calendar_step' );
	}

	UNSAFE_componentWillUpdate( nextProps ) {
		if ( nextProps.signupForm.status === CONCIERGE_STATUS_BOOKED ) {
			// go to confirmation page if booking was successfull
			this.props.onComplete();
		} else if ( nextProps.signupForm.status === CONCIERGE_STATUS_BOOKING_ERROR ) {
			// request new available times
			this.props.requestConciergeInitial( this.props.scheduleId );
		}
	}

	render() {
		const {
			availableTimes,
			appointmentTimespan,
			currentUserLocale,
			onBack,
			signupForm,
			site,
			translate,
		} = this.props;

		return (
			<div>
				<HeaderCake onClick={ onBack }>{ translate( 'Choose Session' ) }</HeaderCake>
				<CompactCard>
					<FormattedHeader
						headerText={ translate( 'Select a time that works for you' ) }
						align="left"
						isSecondary
					/>
					<div class="calendar-step__explanation">
						<div>
							{ translate(
								'Our sessions are available 24 hours a day. If you don’t see a day or time that works for you, please check back soon for more options! '
							) }
						</div>

						<div class="calendar-step__webinars">
							{ translate(
								'In the meantime, consider attending one of our expert webinars on a wide variety of topics designed to help you build and grow your site. {{u}}{{externalLink}}View webinars{{/externalLink}}{{/u}}.',
								{
									components: {
										u: <u />,
										externalLink: (
											<ExternalLinkWithTracking
												icon={ false }
												href="/webinars"
												target="_blank"
												tracksEventName="calypso_concierge_book_view_webinars"
											/>
										),
									},
								}
							) }
						</div>
					</div>
				</CompactCard>

				<AvailableTimePicker
					actionText={ translate( 'Book this session' ) }
					availableTimes={ availableTimes }
					appointmentTimespan={ appointmentTimespan }
					currentUserLocale={ currentUserLocale }
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
	( state ) => ( {
		appointmentTimespan: getConciergeAppointmentTimespan( state ),
		signupForm: getConciergeSignupForm( state ),
		scheduleId: getConciergeScheduleId( state ),
		currentUserId: getCurrentUserId( state ),
		currentUserLocale: getCurrentUserLocale( state ),
	} ),
	{ bookConciergeAppointment, recordTracksEvent, requestConciergeInitial }
)( localize( CalendarStep ) );
