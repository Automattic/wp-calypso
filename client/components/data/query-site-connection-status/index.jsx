/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isRequestingSiteConnectionStatus from 'calypso/state/selectors/is-requesting-site-connection-status';
import { requestConnectionStatus } from 'calypso/state/sites/connection/actions';

class QuerySiteConnectionStatus extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		requestingSiteConnectionStatus: PropTypes.bool,
		requestConnectionStatus: PropTypes.func,
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
		if ( props.requestingSiteConnectionStatus || ! props.siteId ) {
			return;
		}

		props.requestConnectionStatus( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingSiteConnectionStatus: isRequestingSiteConnectionStatus( state, ownProps.siteId ),
		};
	},
	{ requestConnectionStatus }
)( QuerySiteConnectionStatus );
