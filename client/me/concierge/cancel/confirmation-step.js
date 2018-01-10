/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Confirmation from '../shared/confirmation';
import { cancelConciergeAppointment } from 'state/concierge/actions';
import { WPCOM_CONCIERGE_SCHEDULE_ID } from '../constants';

class ConfirmationStep extends Component {
	componentDidMount() {
		const { appointmentId } = this.props;

		this.props.cancelConciergeAppointment( WPCOM_CONCIERGE_SCHEDULE_ID, appointmentId );
	}

	render() {
		const { site, translate } = this.props;

		return (
			<div>
				<Confirmation
					confirmationButton={ translate( 'Schedule' ) }
					confirmationButtonUrl={ `/me/concierge/${ site.slug }` }
					confirmationDescription={ translate( 'Would you like to schedule a new session?' ) }
					confirmationTitle={ translate( 'Your Concierge session is being cancelled!' ) }
				/>
			</div>
		);
	}
}

export default connect( null, { cancelConciergeAppointment } )( localize( ConfirmationStep ) );
