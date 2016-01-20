/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import shallowEqual from 'react-pure-render/shallowEqual';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingSitePostsForQuery } from 'state/posts/selectors';
import { requestSitePosts } from 'state/posts/actions';

class QueryPosts extends Component {
	componentWillMount() {
		if ( ! this.props.requestingPosts ) {
			this.props.requestSitePosts( this.props.siteId, this.props.query );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.requestingPosts || (
				this.props.siteId === nextProps.siteId &&
				shallowEqual( nextProps.query, this.props.query ) ) ) {
			return;
		}

		nextProps.requestSitePosts( nextProps.siteId, nextProps.query );
	}

	render() {
		return null;
	}
}

QueryPosts.propTypes = {
	siteId: PropTypes.number,
	query: PropTypes.object,
	requestingPosts: PropTypes.bool,
	requestSitePosts: PropTypes.func
};

QueryPosts.defaultProps = {
	requestSitePosts: () => {}
};

export default connect(
	( state, ownProps ) => {
		const { siteId, query } = ownProps;
		return {
			requestingPosts: isRequestingSitePostsForQuery( state, siteId, query )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestSitePosts
		}, dispatch );
	}
)( QueryPosts );
