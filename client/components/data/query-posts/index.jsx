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
import { getSitePostsForQuery, isRequestingSitePostsForQuery } from 'state/posts/selectors';
import { requestSitePosts } from 'state/posts/actions';

class QueryPosts extends Component {
	shouldComponentUpdate( nextProps ) {
		return (
			nextProps.siteId !== this.props.siteId ||
			! shallowEqual( nextProps.query, this.props.query )
		);
	}

	componentWillMount() {
		this.maybeRequestPosts( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.maybeRequestPosts( nextProps );
	}

	maybeRequestPosts( props ) {
		if ( props.siteId && ! props.posts && ! props.isRequestingPosts ) {
			props.requestSitePosts( props.siteId, props.query );
		}
	}

	render() {
		return null;
	}
}

QueryPosts.propTypes = {
	siteId: PropTypes.number,
	query: PropTypes.object,
	posts: PropTypes.array,
	isRequestingPosts: PropTypes.bool,
	requestSitePosts: PropTypes.func
};

QueryPosts.defaultProps = {
	requestSitePosts: () => {}
};

export default connect(
	( state, ownProps ) => {
		const { siteId, query } = ownProps;
		return {
			posts: getSitePostsForQuery( state, siteId, query ),
			isRequestingPosts: isRequestingSitePostsForQuery( state, siteId, query )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestSitePosts
		}, dispatch );
	}
)( QueryPosts );
