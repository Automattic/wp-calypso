/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import { requestPostRevisionAuthors } from 'calypso/state/posts/revisions/authors/actions';

class QueryPostRevisionAuthors extends Component {
	static propTypes = {
		requestPostRevisionAuthors: PropTypes.func,
		siteId: PropTypes.number,
		userIds: PropTypes.arrayOf( PropTypes.number ),
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if (
			isShallowEqual( this.props.userIds, prevProps.userIds ) &&
			this.props.siteId === prevProps.siteId
		) {
			return;
		}

		this.request();
	}

	request() {
		const { siteId, userIds } = this.props;
		// Only request post revision authors authors if a list of user Ids is provided. Otherwise, all users would be requested incl. the current user.
		if ( userIds.length ) {
			this.props.requestPostRevisionAuthors( siteId, userIds );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, {
	requestPostRevisionAuthors,
} )( QueryPostRevisionAuthors );
