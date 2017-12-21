/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestConciergeAvailableTimes } from 'state/concierge/actions';

class QueryConciergeAvailableTimes extends Component {
	componentWillMount() {
		this.props.requestConciergeAvailableTimes( this.props.scheduleId );
	}

	render() {
		return null;
	}
}

export default connect( state => state, { requestConciergeAvailableTimes } )(
	QueryConciergeAvailableTimes
);
