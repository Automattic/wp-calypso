/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestConciergeSessionsCount } from 'state/concierge/actions';

class QueryConciergeSessionsCount extends Component {
	componentDidMount() {
		this.props.requestConciergeSessionsCount();
	}

	render() {
		return null;
	}
}

export default connect(
	state => state,
	{ requestConciergeSessionsCount }
)( QueryConciergeSessionsCount );
