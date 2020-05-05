/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestConciergeAppointmentDetails } from 'state/concierge/actions';

class QueryConciergeAppointmentDetails extends Component {
	UNSAFE_componentWillMount() {
		const { appointmentId, scheduleId } = this.props;
		this.props.requestConciergeAppointmentDetails( scheduleId, appointmentId );
	}

	render() {
		return null;
	}
}

export default connect( ( state ) => state, { requestConciergeAppointmentDetails } )(
	QueryConciergeAppointmentDetails
);
