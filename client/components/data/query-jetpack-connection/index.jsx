/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingJetpackConnectionStatus } from 'state/selectors';
import { requestJetpackConnectionStatus } from 'state/jetpack/connection/actions';

class QueryJetpackConnection extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingJetpackConnectionStatus: PropTypes.bool,
		requestJetpackConnectionStatus: PropTypes.func
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.requestingJetpackConnectionStatus ) {
			return;
		}

		props.requestJetpackConnectionStatus( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingJetpackConnectionStatus: isRequestingJetpackConnectionStatus( state, ownProps.siteId )
		};
	},
	{ requestJetpackConnectionStatus }
)( QueryJetpackConnection );
