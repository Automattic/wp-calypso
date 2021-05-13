/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestEarnings } from 'calypso/state/memberships/earnings/actions';

class QueryMembershipsEarnings extends Component {
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

		this.props.requestEarnings( this.props.siteId );
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

export default connect( null, { requestEarnings } )( QueryMembershipsEarnings );
