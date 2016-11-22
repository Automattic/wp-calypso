/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
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
	null,
	{ ticketSupportConfigurationRequest }
)( QueryTicketSupportConfiguration );
