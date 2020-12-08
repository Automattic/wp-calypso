/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteRoles } from 'calypso/state/site-roles/selectors';
import { requestSiteRoles } from 'calypso/state/site-roles/actions';

class QuerySiteRoles extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingSiteRoles: PropTypes.bool,
		requestSiteRoles: PropTypes.func,
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
		if ( props.requestingSiteRoles ) {
			return;
		}

		props.requestSiteRoles( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingSiteRoles: isRequestingSiteRoles( state, ownProps.siteId ),
		};
	},
	{ requestSiteRoles }
)( QuerySiteRoles );
