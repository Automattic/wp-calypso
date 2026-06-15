import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryConciergeAppointmentDetails from 'calypso/components/data/query-concierge-appointment-details';
import QueryConciergeInitial from 'calypso/components/data/query-concierge-initial';
import QuerySites from 'calypso/components/data/query-sites';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { cancelConciergeAppointment } from 'calypso/state/concierge/actions';
import getConciergeAppointmentDetails from 'calypso/state/selectors/get-concierge-appointment-details';
import getConciergeScheduleId from 'calypso/state/selectors/get-concierge-schedule-id';
import getConciergeSignupForm from 'calypso/state/selectors/get-concierge-signup-form';
import { getSite } from 'calypso/state/sites/selectors';
import { CONCIERGE_STATUS_CANCELLED, CONCIERGE_STATUS_CANCELLING } from '../constants';
import Confirmation from '../shared/confirmation';
import { renderDisallowed } from '../shared/utils';

class ConciergeCancel extends Component {
	static propTypes = {
		analyticsPath: PropTypes.string,
		analyticsTitle: PropTypes.string,
		appointmentId: PropTypes.string.isRequired,
		siteSlug: PropTypes.string.isRequired,
		scheduleId: PropTypes.number,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_cancel_step' );
	}
	cancelAppointment = () => {
		const { appointmentId, scheduleId } = this.props;
		this.props.cancelConciergeAppointment( scheduleId, appointmentId );
	};

	renderBtnPlaceholder() {
		return (
			<div className="cancel__placeholders">
				<div className="cancel__placeholder-button-container">
					<div className="cancel__placeholder-button is-placeholder" />
					<div className="cancel__placeholder-button is-placeholder" />
				</div>
			</div>
		);
	}

	getDisplayComponent = () => {
		const { appointmentId, appointmentDetails, scheduleId, siteSlug, signupForm, translate } =
			this.props;

		switch ( signupForm.status ) {
			case CONCIERGE_STATUS_CANCELLED:
				return (
					<Confirmation
						description={ translate( 'Would you like to schedule a new session?' ) }
						title={ translate( 'Your session has been cancelled.' ) }
					>
						<Button
							className="cancel__schedule-button"
							href={ `/me/quickstart/${ siteSlug }/book` }
							primary
						>
							{ translate( 'Schedule', {
								context: 'Concierge session',
							} ) }
						</Button>
					</Confirmation>
				);

			default: {
				const disabledCancelling =
					includes(
						[ CONCIERGE_STATUS_CANCELLED, CONCIERGE_STATUS_CANCELLING ],
						signupForm.status
					) ||
					! appointmentDetails ||
					! scheduleId;

				const disabledRescheduling =
					signupForm.status === CONCIERGE_STATUS_CANCELLING || ! appointmentDetails || ! scheduleId;

				const canChangeAppointment = appointmentDetails?.meta.canChangeAppointment;

				if ( appointmentDetails && ! canChangeAppointment ) {
					return renderDisallowed( translate, siteSlug );
				}

				return (
					<div>
						{ scheduleId && (
							<QueryConciergeAppointmentDetails
								appointmentId={ appointmentId }
								scheduleId={ scheduleId }
							/>
						) }

						<HeaderCake backHref={ `/me/quickstart/${ siteSlug }/book` }>
							{ translate( 'Reschedule or cancel' ) }
						</HeaderCake>
						<Confirmation
							description={ translate(
								'You can also reschedule your session. What would you like to do?'
							) }
							title={ translate( 'Cancel your session' ) }
						>
							{ ! appointmentDetails && this.renderBtnPlaceholder() }
							{ appointmentDetails && (
								<>
									<Button
										className="cancel__reschedule-button"
										disabled={ disabledRescheduling }
										href={ `/me/quickstart/${ siteSlug }/${ appointmentId }/reschedule` }
									>
										{ translate( 'Reschedule session' ) }
									</Button>

									<Button
										className="cancel__confirmation-button"
										disabled={ disabledCancelling }
										onClick={ this.cancelAppointment }
										primary
										scary
									>
										{ translate( 'Cancel session' ) }
									</Button>
								</>
							) }
						</Confirmation>
					</div>
				);
			}
		}
	};

	render() {
		const { analyticsPath, analyticsTitle, site } = this.props;
		const siteId = site && site.ID;

		return (
			<Main>
				<QuerySites />
				{ siteId && <QueryConciergeInitial siteId={ siteId } /> }
				<PageViewTracker path={ analyticsPath } title={ analyticsTitle } />
				{ this.getDisplayComponent() }
			</Main>
		);
	}
}

export default connect(
	( state, props ) => ( {
		appointmentDetails: getConciergeAppointmentDetails( state, props.appointmentId ),
		signupForm: getConciergeSignupForm( state ),
		site: getSite( state, props.siteSlug ),
		scheduleId: getConciergeScheduleId( state ),
	} ),
	{ cancelConciergeAppointment, recordTracksEvent }
)( localize( ConciergeCancel ) );
