/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isFetchingPublicizeShareActions from 'state/selectors/is-fetching-publicize-share-actions';
import { fetchPostShareActions } from 'state/sharing/publicize/publicize-actions/actions';

class QuerySharePostActions extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		// Connected props
		isRequesting: PropTypes.bool.isRequired,
		fetchPostShareActions: PropTypes.func.isRequired,
	}

	componentDidMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId &&
			this.props.postId === nextProps.postId ) {
			return;
		}
		this.request( nextProps );
	}

	request( props ) {
		if ( ! props.isRequesting ) {
			props.fetchPostShareActions( props.siteId, props.postId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId, postId } ) => ( {
		isRequesting: isFetchingPublicizeShareActions( state, siteId, postId ),
	} ),
	{ fetchPostShareActions }
)( QuerySharePostActions );
