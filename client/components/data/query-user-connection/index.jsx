/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSite } from 'calypso/state/sites/selectors';
import { isUserConnected } from 'calypso/state/jetpack-connect/actions';

class QueryUserConnection extends Component {
	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.siteId && ! props.requestingSite ) {
			props.isUserConnected( props.siteId, props.siteIsOnSitesList );
		}
	}

	render() {
		return null;
	}
}

QueryUserConnection.propTypes = {
	siteId: PropTypes.number,
	siteIsOnSitesList: PropTypes.bool,
	requestingSite: PropTypes.bool,
	isUserConnected: PropTypes.func,
};

QueryUserConnection.defaultProps = {
	isUserConnected: () => {},
	siteIsOnSitesList: false,
};

export default connect(
	( state, { siteId } ) => {
		return {
			requestingSite: isRequestingSite( state, siteId ),
		};
	},
	{ isUserConnected }
)( QueryUserConnection );
