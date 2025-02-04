import { CompactCard, FormLabel } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { without } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryConciergeAppointmentDetails from 'calypso/components/data/query-concierge-appointment-details';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import Timezone from 'calypso/components/timezone';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	rescheduleConciergeAppointment,
	updateConciergeAppointmentDetails,
} from 'calypso/state/concierge/actions';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import getConciergeAppointmentDetails from 'calypso/state/selectors/get-concierge-appointment-details';
import getConciergeAppointmentTimespan from 'calypso/state/selectors/get-concierge-appointment-timespan';
import getConciergeScheduleId from 'calypso/state/selectors/get-concierge-schedule-id';
import getConciergeSignupForm from 'calypso/state/selectors/get-concierge-signup-form';
import { CONCIERGE_STATUS_BOOKING, CONCIERGE_STATUS_BOOKED } from '../constants';
import AvailableTimePicker from '../shared/available-time-picker';
import { renderDisallowed } from '../shared/utils';

class CalendarStep extends Component {
	static propTypes = {
		appointmentDetails: PropTypes.object,
		appointmentId: PropTypes.string.isRequired,
		availableTimes: PropTypes.array.isRequired,
		currentUserLocale: PropTypes.string.isRequired,
		onComplete: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
		signupForm: PropTypes.object.isRequired,
		scheduleId: PropTypes.number,
	};

	onSubmit = ( timestamp ) => {
		const { appointmentDetails, appointmentId, scheduleId } = this.props;

		this.props.rescheduleConciergeAppointment(
			scheduleId,
			appointmentId,
			timestamp,
			appointmentDetails
		);
	};

	setTimezone = ( timezone ) => {
		const { appointmentDetails, appointmentId } = this.props;
		this.props.updateConciergeAppointmentDetails( appointmentId, {
			...appointmentDetails,
			meta: { ...appointmentDetails.meta, timezone },
		} );
	};

	getFilteredTimeSlots = () => {
		// filter out current timeslot
		const { appointmentDetails, availableTimes } = this.props;
		return without( availableTimes, appointmentDetails.beginTimestamp );
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_reschedule_calendar_step' );
	}

	componentDidUpdate() {
		if ( this.props.signupForm.status === CONCIERGE_STATUS_BOOKED ) {
			// go to confirmation page if booking was successful
			this.props.onComplete();
		}
	}

	render() {
		const {
			appointmentDetails,
			appointmentId,
			appointmentTimespan,
			currentUserLocale,
			signupForm,
			site,
			scheduleId,
			translate,
		} = this.props;
		const canChangeAppointment = appointmentDetails?.meta.canChangeAppointment;
		if ( appointmentDetails && ! canChangeAppointment ) {
			return renderDisallowed( translate, site.slug );
		}

		return (
			<div>
				<QueryConciergeAppointmentDetails
					appointmentId={ appointmentId }
					scheduleId={ scheduleId }
				/>

				<CompactCard>
					{ translate(
						'To reschedule your session, let us know your timezone and preferred day.'
					) }
				</CompactCard>

				{ appointmentDetails && (
					<div>
						<CompactCard>
							<FormFieldset>
								<FormLabel>{ translate( "What's your timezone?" ) }</FormLabel>
								<Timezone
									includeManualOffsets={ false }
									name="timezone"
									onSelect={ this.setTimezone }
									selectedZone={ appointmentDetails.meta.timezone }
								/>
								<FormSettingExplanation>
									{ translate( 'Choose a city in your timezone.' ) }
								</FormSettingExplanation>
							</FormFieldset>
						</CompactCard>

						<AvailableTimePicker
							actionText={ translate( 'Reschedule to this date' ) }
							availableTimes={ this.getFilteredTimeSlots() }
							appointmentTimespan={ appointmentTimespan }
							currentUserLocale={ currentUserLocale }
							disabled={ signupForm.status === CONCIERGE_STATUS_BOOKING || ! appointmentDetails }
							onBack={ null }
							onSubmit={ this.onSubmit }
							site={ site }
							timezone={ appointmentDetails.meta.timezone }
						/>
					</div>
				) }
			</div>
		);
	}
}

export default connect(
	( state, props ) => ( {
		appointmentDetails: getConciergeAppointmentDetails( state, props.appointmentId ),
		appointmentTimespan: getConciergeAppointmentTimespan( state ),
		currentUserLocale: getCurrentUserLocale( state ),
		signupForm: getConciergeSignupForm( state ),
		scheduleId: getConciergeScheduleId( state ),
	} ),
	{ recordTracksEvent, rescheduleConciergeAppointment, updateConciergeAppointmentDetails }
)( localize( CalendarStep ) );
