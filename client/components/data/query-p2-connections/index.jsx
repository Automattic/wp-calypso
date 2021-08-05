/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isKeyringConnectionsFetching } from 'calypso/state/sharing/keyring/selectors';
import { requestP2KeyringConnections } from 'calypso/state/sharing/keyring/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class QueryP2Connections extends Component {
	componentDidMount() {
		if ( ! this.props.isKeyringConnectionsFetching && this.props.siteId ) {
			this.props.requestConnections( this.props.siteId );
		}
	}

	componentDidUpdate( { siteId } ) {
		if ( this.props.siteId && siteId !== this.props.siteId && ! this.props.requestingConnections ) {
			this.props.requestConnections( this.props.siteId );
		}
	}

	render() {
		return null;
	}
}

QueryP2Connections.propTypes = {
	requestConnections: PropTypes.func,
	requestingConnections: PropTypes.bool,
	siteId: PropTypes.number,
};

QueryP2Connections.defaultProps = {
	requestConnections: () => {},
	requestingConnections: false,
	siteId: 0,
};

export default connect(
	( state, { siteId } ) => {
		siteId = siteId || getSelectedSiteId( state );

		return {
			requestingConnections: isKeyringConnectionsFetching( state, siteId ),
			siteId,
		};
	},
	{
		requestConnections: requestP2KeyringConnections,
	}
)( QueryP2Connections );
