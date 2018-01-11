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

class ConciergeCancel extends Component {
	static propTypes = {
		appointmentId: PropTypes.string.isRequired,
		siteSlug: PropTypes.string.isRequired,
	};

	getDisplayComponent = () => {
		let cancellingMessage;
		const { siteSlug, signupForm, translate } = this.props;

		switch ( signupForm.status ) {
			case CONCIERGE_STATUS_CANCELLED:
				cancellingMessage = translate( 'Your Concierge session has been cancelled!' );
				break;

			case CONCIERGE_STATUS_CANCELLING_ERROR:
				cancellingMessage = translate( 'We did not manage to cancel your session!' );
				break;

			default:
				return <Skeleton />;
		}

		return (
			<Confirmation
				buttonLabel={ translate( 'Schedule' ) }
				buttonUrl={ `/me/concierge/${ siteSlug }/book` }
				description={ translate( 'Would you like to schedule a new session?' ) }
				title={ cancellingMessage }
			/>
		);
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
