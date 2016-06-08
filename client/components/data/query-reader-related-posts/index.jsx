/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { shouldFetchRelated } from 'state/reader/related-posts/selectors';
import { requestRelatedPosts } from 'state/reader/related-posts/actions';

class QueryReaderRelatedPosts extends Component {
	componentWillMount() {
		if ( this.props.shouldFetch ) {
			this.props.requestRelatedPosts( this.props.siteId, this.props.postId );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.shouldFetch || ( this.props.siteId === nextProps.siteId && ( this.props.postId === nextProps.postId ) ) ) {
			return;
		}

		nextProps.requestRelatedPosts( nextProps.siteId, nextProps.postId );
	}

	render() {
		return null;
	}
}

QueryReaderRelatedPosts.propTypes = {
	siteId: PropTypes.number,
	postId: PropTypes.number,
	shouldFetch: PropTypes.bool,
	requestRelatedPosts: PropTypes.func
};

QueryReaderRelatedPosts.defaultProps = {
	requestRelatedPosts: () => {}
};

export default connect(
	( state, ownProps ) => {
		const { siteId, postId } = ownProps;
		return {
			shouldFetch: shouldFetchRelated( state, siteId, postId )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestRelatedPosts
		}, dispatch );
	}
)( QueryReaderRelatedPosts );
