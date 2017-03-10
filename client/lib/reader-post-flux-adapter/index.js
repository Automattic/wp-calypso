/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { every, map } from 'lodash';
import { connect } from 'react-redux';

/*
 * Internal Dependencies
 */
import FeedPostStore from 'lib/feed-post-store';
import { fetchPost } from 'lib/feed-post-store/actions';
import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';
import Perf from 'react-addons-perf'; // ES6
Perf.start();
window.Perf = Perf;

/**
 * A HoC function that translates a postKey or postKeys into a post or posts for its child.
 */
const fluxPostAdapter = Component => {

	class ReaderPostFluxAdapter extends React.Component {
		static propTypes = {
			postKey: PropTypes.object,
			selectedPost: PropTypes.string
		}

		getStateFromStores = ( props = this.props ) => {
			const { postKey } = props;
			const posts = map(
				postKey.postIds,
				postId => {
					const postKeyForPost = {};
					if ( postKey.feedId ) {
						postKeyForPost.feedId = postKey.feedId;
					} else {
						postKeyForPost.blogId = postKey.blogId;
					}
					postKeyForPost.postId = postId;
					const post = FeedPostStore.get( postKeyForPost )
					if ( ! post || post._state === 'minimal' ) {
						fetchPost( postKeyForPost );
					}
					return post;
				}
			);

			return { posts };
		}

		state = this.getStateFromStores( this.props );

		updateState = ( newState = this.getStateFromStores() ) => {
			this.setState( newState );
		}

		// should not update if all of the posts refer to the same objects
		shouldComponentUpdate( nextProps, nextState ) {
			const differentPosts = ! every(
				nextState.posts,
				( post, index ) => post === this.state.posts[ index ]
			);
			return differentPosts;
		}

		componentWillMount() {
			FeedPostStore.on( 'change', this.updateState );
		}

		componentWillReceiveProps( nextProps ) {
			this.updateState( this.getStateFromStores( nextProps ) );
		}

		componentWillUnmount() {
			FeedPostStore.off( 'change', this.updateState );
		}

		render() {
			const { post, posts } = this.state;
			if ( ! post && ! posts ) {
				return null;
			}
			return <Component { ...{ ...this.props, post, posts } } />;
		}
	}

	return connect(
		( state, ownProps ) => {
			const { feedId, blogId } = ownProps.postKey;
			let feed, site;
			if ( feedId ) {
				feed = getFeed( state, feedId );
				site = feed && feed.blog_ID ? getSite( state, feed.blog_ID ) : undefined;
			} else {
				site = getSite( state, blogId );
				feed = site && site.feed_ID ? getFeed( state, site.feed_ID ) : undefined;
			}
			return {
				feed,
				site
			};
		}
	)( ReaderPostFluxAdapter );
};

export default fluxPostAdapter;
