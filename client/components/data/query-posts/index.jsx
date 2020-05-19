/**
 * External dependencies
 */
import { Component } from 'react';
import isShallowEqual from '@wordpress/is-shallow-equal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import debug from 'debug';

/**
 * Internal dependencies
 */
import { isRequestingPostsForQuery, isRequestingSitePost } from 'state/posts/selectors';
import { requestSitePosts, requestSitePost, requestAllSitesPosts } from 'state/posts/actions';

/**
 * Module variables
 */
const log = debug( 'calypso:query-posts' );

class QueryPosts extends Component {
	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			this.props.siteId === nextProps.siteId &&
			this.props.postId === nextProps.postId &&
			isShallowEqual( this.props.query, nextProps.query )
		) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		const singleSite = !! props.siteId;
		const singlePost = !! props.postId;

		if ( singleSite ) {
			if ( ! singlePost && ! props.requestingPosts ) {
				log( 'Request post list for site %d using query %o', props.siteId, props.query );
				props.requestSitePosts( props.siteId, props.query );
			}

			if ( singlePost && ! props.requestingPost ) {
				log( 'Request single post for site %d post %d', props.siteId, props.postId );
				props.requestSitePost( props.siteId, props.postId );
			}
		} else if ( ! props.requestingPosts ) {
			log( 'Request post list for all sites using query %o', props.query );
			props.requestAllSitesPosts( props.query );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		const { siteId, postId, query } = ownProps;
		return {
			requestingPost: siteId && postId && isRequestingSitePost( state, siteId, postId ),
			requestingPosts: isRequestingPostsForQuery( state, siteId, query ),
		};
	},
	( dispatch ) => {
		return bindActionCreators(
			{
				requestSitePosts,
				requestAllSitesPosts,
				requestSitePost,
			},
			dispatch
		);
	}
)( QueryPosts );
