/** @format */
/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestRewindState } from 'state/rewind/actions';

export class QueryRewindState extends Component {
	componentDidMount() {
		this.request();
	}

	request() {
		const { requestState, siteId } = this.props;

		if ( ! siteId ) {
			return;
		}

		requestState( siteId );
	}

	render() {
		return null;
	}
}

const mapDispatchToProps = {
	requestState: requestRewindState,
};

export default connect( null, mapDispatchToProps )( QueryRewindState );
