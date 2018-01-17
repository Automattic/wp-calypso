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
import Main from 'components/main';
import Card from 'components/card';
import { localize } from 'i18n-calypso';
import Confirmation from '../shared/confirmation';
import Skeleton from './skeleton';
import { cancelConciergeAppointment } from 'state/concierge/actions';
import {
	WPCOM_CONCIERGE_SCHEDULE_ID,
	CONCIERGE_STATUS_CANCELLED,
	CONCIERGE_STATUS_CANCELLING_ERROR,
} from '../constants';
import { getConciergeSignupForm } from 'state/selectors';
import analytics from 'lib/analytics';

class ConciergeCancel extends Component {
	static propTypes = {
		appointmentId: PropTypes.string.isRequired,
		siteSlug: PropTypes.string.isRequired,
	};

	componentDidMount() {
		analytics.tracks.recordEvent( 'calypso_concierge_cancel_step' );
	}

	getDisplayComponent = () => {
		const { siteSlug, signupForm, translate } = this.props;

		switch ( signupForm.status ) {
			case CONCIERGE_STATUS_CANCELLED:
				return (
					<Confirmation
						buttonLabel={ translate( 'Schedule' ) }
						buttonUrl={ `/me/concierge/${ siteSlug }/book` }
						description={ translate( 'Would you like to schedule a new session?' ) }
						title={ translate( 'Your Concierge session has been cancelled.' ) }
					/>
				);

			case CONCIERGE_STATUS_CANCELLING_ERROR:
				return (
					<Card highlight="error">
						{ translate( "We couldn't cancel your session, please try again later." ) }
					</Card>
				);

			default:
				return <Skeleton />;
		}
	};

	componentDidMount() {
		const { appointmentId } = this.props;
		this.props.cancelConciergeAppointment( WPCOM_CONCIERGE_SCHEDULE_ID, appointmentId );
	}

	render() {
		return <Main> { this.getDisplayComponent() } </Main>;
	}
}

export default connect(
	state => ( {
		signupForm: getConciergeSignupForm( state ),
	} ),
	{ cancelConciergeAppointment }
)( localize( ConciergeCancel ) );
