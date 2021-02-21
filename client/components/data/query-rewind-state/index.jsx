/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestRewindState } from 'calypso/state/rewind/state/actions';

export class QueryRewindState extends Component {
	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId !== this.props.siteId ) {
			this.request();
		}
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
