import { Component } from 'react';
import { connect } from 'react-redux';
import { requestConciergeInitial } from 'calypso/state/concierge/actions';

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
