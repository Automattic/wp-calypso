/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestConciergeSlots } from 'state/concierge/actions';

class QueryConciergeSlots extends Component {
	componentWillMount() {
		this.props.requestConciergeSlots( this.props.scheduleId );
	}

	render() {
		return null;
	}
}

export default connect( state => state, { requestConciergeSlots } )( QueryConciergeSlots );
