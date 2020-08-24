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
		const { siteId } = this.props;

		this.props.requestConciergeInitial( siteId );
	}

	render() {
		return null;
	}
}

export default connect( ( state ) => state, { requestConciergeInitial } )( QueryConciergeInitial );
