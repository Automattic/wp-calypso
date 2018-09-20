/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestConciergeInitial } from 'state/concierge/actions';

class QueryConciergeInitial extends Component {
	componentDidMount() {
		this.props.requestConciergeInitial( this.props.scheduleId );
	}

	render() {
		return null;
	}
}

export default connect(
	state => state,
	{ requestConciergeInitial }
)( QueryConciergeInitial );
