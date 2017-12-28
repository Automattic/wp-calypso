/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteRoles } from 'client/state/site-roles/selectors';
import { requestSiteRoles } from 'client/state/site-roles/actions';

class QuerySiteRoles extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingSiteRoles: PropTypes.bool,
		requestSiteRoles: PropTypes.func,
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
