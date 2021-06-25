/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isRequestingJetpackConnectionStatus from 'calypso/state/selectors/is-requesting-jetpack-connection-status';
import { requestJetpackConnectionStatus } from 'calypso/state/jetpack/connection/actions';

class QueryJetpackConnection extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingJetpackConnectionStatus: PropTypes.bool,
		requestJetpackConnectionStatus: PropTypes.func,
	};

	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
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
			requestingJetpackConnectionStatus: isRequestingJetpackConnectionStatus(
				state,
				ownProps.siteId
			),
		};
	},
	{ requestJetpackConnectionStatus }
)( QueryJetpackConnection );
