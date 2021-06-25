/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isRequestingJetpackUserConnection from 'calypso/state/selectors/is-requesting-jetpack-user-connection';
import { requestJetpackUserConnectionData } from 'calypso/state/jetpack/connection/actions';

class QueryJetpackUserConnection extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		// Connected props
		isRequesting: PropTypes.bool,
		requestJetpackUserConnectionData: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId ) {
			return;
		}
		this.request( nextProps );
	}

	request( props ) {
		if ( props.siteId && ! props.isRequesting ) {
			props.requestJetpackUserConnectionData( props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => ( {
		isRequesting: isRequestingJetpackUserConnection( state, siteId ),
	} ),
	{ requestJetpackUserConnectionData }
)( QueryJetpackUserConnection );
