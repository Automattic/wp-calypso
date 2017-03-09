/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { map } from 'lodash';
import { connect } from 'react-redux';

/*
 * Internal Dependencies
 */
import FeedPostStore from 'lib/feed-post-store';
import { fetchPost } from 'lib/feed-post-store/actions';
import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';

/**
 * A HoC function that translates a postKey or postKeys into a post or posts for its child.
 */
const fluxPostAdapter = Component => {

	class ReaderPostFluxAdapter extends React.Component {
		static propTypes = {
			postKey: PropTypes.object,
		}

		getStateFromStores = ( props = this.props ) => {
			const { postKey } = props;
			const posts = map(
				postKey.postIds,
				postId => {
					const post = FeedPostStore.get( { ...postKey, postId } )
					if ( ! post ) {
						fetchPost( { ...postKey, postId } );
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
			const feed = feedId && getFeed( state, feedId );
			const site = blogId && getSite( state, blogId );
			return {
				feed,
				site
			};
		}
	)( ReaderPostFluxAdapter );
}

export default fluxPostAdapter;
