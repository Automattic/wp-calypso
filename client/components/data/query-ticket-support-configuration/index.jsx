/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	isRequestingTicketSupportConfiguration,
} from 'state/ticket-support/selectors';

import {
	ticketSupportConfigurationRequest,
} from 'state/ticket-support/configuration/actions';

class QueryTicketSupportConfiguration extends Component {
	componentWillMount() {
		this.props.ticketSupportConfigurationRequest();
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		requesting: isRequestingTicketSupportConfiguration( state ),
	} ),
	{ ticketSupportConfigurationRequest }
)( QueryTicketSupportConfiguration );
