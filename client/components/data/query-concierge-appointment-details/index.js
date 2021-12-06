import { Component } from 'react';
import { connect } from 'react-redux';
import { requestConciergeAppointmentDetails } from 'calypso/state/concierge/actions';

class QueryConciergeAppointmentDetails extends Component {
	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
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
