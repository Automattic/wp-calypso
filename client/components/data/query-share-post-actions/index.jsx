/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isFetchingPublicizeShareActionsScheduled from 'calypso/state/selectors/is-fetching-publicize-share-actions-scheduled';
import isFetchingPublicizeShareActionsPublished from 'calypso/state/selectors/is-fetching-publicize-share-actions-published';
import {
	fetchPostShareActionsScheduled,
	fetchPostShareActionsPublished,
} from 'calypso/state/sharing/publicize/publicize-actions/actions';

class QuerySharePostActions extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		status: PropTypes.string,
		// Connected props
		isRequestingScheduled: PropTypes.bool.isRequired,
		isRequestingPublished: PropTypes.bool.isRequired,
		fetchPostShareActionsScheduled: PropTypes.func.isRequired,
		fetchPostShareActionsPublished: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.request( this.props );
	}

	shouldComponentUpdate( nextProps ) {
		if (
			this.props.siteId === nextProps.siteId &&
			this.props.postId === nextProps.postId &&
			this.props.status === nextProps.status
		) {
			return false;
		}
		return true;
	}

	componentDidUpdate() {
		this.request( this.props );
	}

	request( props ) {
		if ( props.status === 'scheduled' && ! props.isRequestingScheduled ) {
			props.fetchPostShareActionsScheduled( props.siteId, props.postId );
		}

		if ( props.status === 'published' && ! props.isRequestingPublished ) {
			props.fetchPostShareActionsPublished( props.siteId, props.postId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId, postId } ) => ( {
		isRequestingScheduled: isFetchingPublicizeShareActionsScheduled( state, siteId, postId ),
		isRequestingPublished: isFetchingPublicizeShareActionsPublished( state, siteId, postId ),
	} ),
	{ fetchPostShareActionsScheduled, fetchPostShareActionsPublished }
)( QuerySharePostActions );
