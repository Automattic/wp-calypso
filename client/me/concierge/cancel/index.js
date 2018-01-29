/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import QueryConciergeAppointmentDetails from 'components/data/query-concierge-appointment-details';
import Button from 'components/button';
import Main from 'components/main';
import { localize } from 'i18n-calypso';
import Confirmation from '../shared/confirmation';
import { cancelConciergeAppointment } from 'state/concierge/actions';
import {
	WPCOM_CONCIERGE_SCHEDULE_ID,
	CONCIERGE_STATUS_CANCELLED,
	CONCIERGE_STATUS_CANCELLING,
} from '../constants';
import { getConciergeAppointmentDetails, getConciergeSignupForm } from 'state/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class ConciergeCancel extends Component {
	static propTypes = {
		appointmentId: PropTypes.string.isRequired,
		siteSlug: PropTypes.string.isRequired,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_cancel_step' );
	}
	cancelAppointment = () => {
		const { appointmentId } = this.props;
		this.props.cancelConciergeAppointment( WPCOM_CONCIERGE_SCHEDULE_ID, appointmentId );
	};

	getDisplayComponent = () => {
		const { appointmentId, appointmentDetails, siteSlug, signupForm, translate } = this.props;

		switch ( signupForm.status ) {
			case CONCIERGE_STATUS_CANCELLED:
				return (
					<Confirmation
						description={ translate( 'Would you like to schedule a new session?' ) }
						title={ translate( 'Your Concierge session has been cancelled.' ) }
					>
						<Button
							className="cancel__schedule-button"
							href={ `/me/concierge/${ siteSlug }/book` }
							primary={ true }
						>
							{ translate( 'Schedule' ) }
						</Button>
					</Confirmation>
				);

			default:
				const disabledCancelling =
					includes(
						[ CONCIERGE_STATUS_CANCELLED, CONCIERGE_STATUS_CANCELLING ],
						signupForm.status
					) || ! appointmentDetails;

				const disabledRescheduling =
					signupForm.status === CONCIERGE_STATUS_CANCELLING || ! appointmentDetails;

				return (
					<div>
						<QueryConciergeAppointmentDetails
							appointmentId={ appointmentId }
							scheduleId={ WPCOM_CONCIERGE_SCHEDULE_ID }
						/>

						<Confirmation
							description={ translate(
								'You can also reschedule your session. What would you like to do?'
							) }
							title={ translate( 'Cancel your Concierge session' ) }
						>
							<Button
								className="cancel__reschedule-button"
								disabled={ disabledRescheduling }
								href={ `/me/concierge/${ siteSlug }/${ appointmentId }/reschedule` }
							>
								{ translate( 'Reschedule session' ) }
							</Button>

							<Button
								className="cancel__confirmation-button"
								disabled={ disabledCancelling }
								onClick={ this.cancelAppointment }
								primary={ true }
								scary={ true }
							>
								{ translate( 'Cancel session' ) }
							</Button>
						</Confirmation>
					</div>
				);
		}
	};

	render() {
		return <Main> { this.getDisplayComponent() } </Main>;
	}
}

export default connect(
	( state, props ) => ( {
		appointmentDetails: getConciergeAppointmentDetails( state, props.appointmentId ),
		signupForm: getConciergeSignupForm( state ),
	} ),
	{ cancelConciergeAppointment, recordTracksEvent }
)( localize( ConciergeCancel ) );
