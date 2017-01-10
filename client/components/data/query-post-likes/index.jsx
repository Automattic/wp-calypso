/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingPostLikes } from 'state/selectors';
import { requestPostLikes } from 'state/posts/likes/actions';

class QueryPostLikes extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		isRequesting: PropTypes.bool,
		requestPostLikes: PropTypes.func
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if (
			this.props.siteId !== nextProps.siteId ||
			this.props.postId !== nextProps.postId
		) {
			this.request( nextProps );
		}
	}

	request( props ) {
		const { isRequesting, postId, siteId } = props;
		if ( isRequesting ) {
			return;
		}

		props.requestPostLikes( siteId, postId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			isRequesting: isRequestingPostLikes( state, ownProps.siteId )
		};
	},
	{ requestPostLikes }
)( QueryPostLikes );
