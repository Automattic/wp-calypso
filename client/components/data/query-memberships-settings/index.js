/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSettings } from 'calypso/state/memberships/settings/actions';

class QueryMembershipsSettings extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestEarnings: PropTypes.func,
	};

	request() {
		if ( this.props.requesting ) {
			return;
		}

		if ( ! this.props.siteId ) {
			return;
		}

		this.props.requestSettings( this.props.siteId );
	}

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId !== prevProps.siteId ) {
			this.request();
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestSettings } )( QueryMembershipsSettings );
