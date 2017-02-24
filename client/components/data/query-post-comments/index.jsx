/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestPostComments } from 'state/comments/actions';

class QueryPostComments extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		isRequesting: PropTypes.bool,
		requestPostComments: PropTypes.func
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

	request( { siteId, postId, isRequesting, requestPostComments } ) {
		if ( isRequesting ) {
			return;
		}

		requestPostComments( siteId, postId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId, postId } ) => {
		return {
			isRequesting: { siteId, postId }
		}
	},
	{ requestPostComments }
)(QueryPostComments)
