/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import { Component } from 'react';
import shallowEqual from 'react-pure-render/shallowEqual';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import debug from 'debug';

/**
 * Internal dependencies
 */
import { isRequestingSitePostsForQuery, isRequestingSitePost } from 'state/posts/selectors';
import { requestSitePosts, requestSitePost } from 'state/posts/actions';

/**
 * Module variables
 */
const log = debug( 'calypso:query-posts' );

class QueryPosts extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId &&
				this.props.postId === nextProps.postId &&
				shallowEqual( this.props.query, nextProps.query ) ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		const single = !! props.postId;

		if ( ! single && ! props.requestingPosts ) {
			log( 'Request post list for site %d using query %o', props.siteId, props.query );
			props.requestSitePosts( props.siteId, props.query );
		}

		if ( single && ! props.requestingPost ) {
			log( 'Request single post for site %d post %d', props.siteId, props.postId );
			props.requestSitePost( props.siteId, props.postId );
		}
	}

	render() {
		return null;
	}
}

QueryPosts.propTypes = {
	siteId: PropTypes.number,
	postId: PropTypes.number,
	query: PropTypes.object,
	requestingPosts: PropTypes.bool,
	requestSitePosts: PropTypes.func
};

QueryPosts.defaultProps = {
	requestSitePosts: () => {}
};

export default connect(
	( state, ownProps ) => {
		const { siteId, postId, query } = ownProps;
		return {
			requestingPost: isRequestingSitePost( state, siteId, postId ),
			requestingPosts: isRequestingSitePostsForQuery( state, siteId, query )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestSitePosts,
			requestSitePost
		}, dispatch );
	}
)( QueryPosts );
