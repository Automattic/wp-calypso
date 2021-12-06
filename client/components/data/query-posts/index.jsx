import isShallowEqual from '@wordpress/is-shallow-equal';
import debug from 'debug';
import { Component } from 'react';
import { connect } from 'react-redux';
import {
	requestSitePosts,
	requestSitePost,
	requestAllSitesPosts,
} from 'calypso/state/posts/actions';
import { isRequestingPostsForQuery, isRequestingSitePost } from 'calypso/state/posts/selectors';

/**
 * Module variables
 */
const log = debug( 'calypso:query-posts' );

class QueryPosts extends Component {
	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
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
	{
		requestSitePosts,
		requestAllSitesPosts,
		requestSitePost,
	}
)( QueryPosts );
