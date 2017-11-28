/** @format */

/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shallowEqual from 'react-pure-render/shallowEqual';

/**
 * Internal dependencies
 */
import { getCurrentUserId } from 'state/current-user/selectors';
import { requestUsers } from 'state/users/actions';

class QueryUsers extends Component {
	static propTypes = {
		currentUserId: PropTypes.number,
		requestUsers: PropTypes.func,
		siteId: PropTypes.number,
		userIds: PropTypes.arrayOf( PropTypes.number ),
	};

	componentWillMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if (
			shallowEqual( this.props.userIds, prevProps.userIds ) &&
			this.props.siteId === prevProps.siteId
		) {
			return;
		}

		this.request();
	}

	request() {
		const { siteId, userIds, currentUserId } = this.props;
		// Ensure that we only request the authors whose information we're lacking, not the current user.
		const requestIds = userIds.filter( id => id !== currentUserId );
		// Only request users if a list of user Ids is provided. Otherwise, all users would be requested incl. the current user.
		if ( requestIds.length ) {
			this.props.requestUsers( siteId, requestIds );
		}
	}

	render() {
		return null;
	}
}

export default connect( state => ( { currentUserId: getCurrentUserId( state ) } ), {
	requestUsers,
} )( QueryUsers );
