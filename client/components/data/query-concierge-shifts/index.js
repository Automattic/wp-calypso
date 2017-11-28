/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestConciergeShifts } from 'state/concierge/actions';

class QueryConciergeShifts extends Component {
	componentWillMount() {
		this.props.requestConciergeShifts( this.props.scheduleId );
	}

	render() {
		return null;
	}
}

export default connect( state => state, { requestConciergeShifts } )( QueryConciergeShifts );
