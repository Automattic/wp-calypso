import { omit, includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component, forwardRef, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import PostBlocked from 'calypso/blocks/reader-post-card/blocked';
import BloggingPromptCard from 'calypso/components/blogging-prompt-card';
import compareProps from 'calypso/lib/compare-props';
import { useCachedPost } from 'calypso/reader/data/post/cache';
import { IN_STREAM_RECOMMENDATION } from 'calypso/reader/follow-sources';
import XPostHelper, { isXPost } from 'calypso/reader/xpost-helper';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import EmptySearchRecommendedPost from './empty-search-recommended-post';
import Post from './post';
import PostPlaceholder from './post-placeholder';
import PostUnavailable from './post-unavailable';
import RecommendedPosts from './recommended-posts';
import CrossPost from './x-post';

/**
 * Hook to return a [callback ref](https://reactjs.org/docs/refs-and-the-dom.html#callback-refs)
 * that MUST be used as the `ref` prop on a `div` element.
 * The hook ensures that we generate post display Tracks events when the user views
 * the underlying `div` element.
 * @param postObj Object The post data.
 * @param recordTracksEvent Function The function to call to record a Tracks event with standardized Reader props.
 * @returns A callback ref that MUST be used on a div element for tracking.
 */
const useTrackPostView = ( postObj, recordTracksEvent ) => {
	const observerRef = useRef();

	// Use a callback as the ref so we get called for both mount and unmount events
	// We don't get both if we use useRef() and useEffect() together.
	return useCallback(
		( wrapperDiv ) => {
			// If we don't have a wrapper div, we aren't mounted and should remove the observer
			if ( ! wrapperDiv ) {
				observerRef.current?.disconnect?.();
				return;
			}

			const intersectionHandler = ( entries ) => {
				const [ entry ] = entries;
				if ( ! entry.isIntersecting ) {
					return;
				}

				recordTracksEvent( 'calypso_reader_post_display', null, { post: postObj } );
			};

			observerRef.current = new IntersectionObserver( intersectionHandler, {
				// Only fire the event when 60% of the element becomes visible
				threshold: [ 0.6 ],
			} );

			observerRef.current.observe( wrapperDiv );
		},
		[ postObj, observerRef, recordTracksEvent ]
	);
};

/**
 * We wrap the class component Post in a function component to make use of
 * the useTrackPostView hook.
 * @param {...Object} props The Post props.
 * @returns A React component that renders a post and tracks when the post is displayed.
 */
const TrackedPost = ( { ...props } ) => {
	const trackingDivRef = useTrackPostView( props.post, props.recordReaderTracksEvent );

	return <Post postRef={ trackingDivRef } { ...props } />;
};

class PostLifecycle extends Component {
	static propTypes = {
		postKey: PropTypes.object.isRequired,
		isDiscoverStream: PropTypes.bool,
		handleClick: PropTypes.func,
		recStreamKey: PropTypes.string,
		fixedHeaderHeight: PropTypes.number,
	};

	render() {
		const { post, postKey, recsStreamKey, streamKey, siteId, isDiscoverStream } = this.props;

		if ( this.props.isSynthetic ) {
			return <TrackedPost { ...this.props } />;
		}

		if ( postKey.isRecommendationBlock ) {
			return (
				<RecommendedPosts
					recommendations={ postKey.recommendations }
					index={ postKey.index }
					streamKey={ recsStreamKey }
					followSource={ IN_STREAM_RECOMMENDATION }
					itemRef={ this.props.itemRef }
				/>
			);
		} else if ( postKey.isPromptBlock ) {
			return (
				<div
					ref={ this.props.itemRef }
					className="reader-stream__blogging-prompt"
					key={ 'blogging-prompt-card-' + postKey.index }
				>
					<BloggingPromptCard
						siteId={ siteId }
						viewContext="reader"
						showMenu={ false }
						index={ postKey.index }
					/>
				</div>
			);
		} else if ( ! isDiscoverStream && streamKey?.indexOf( 'rec' ) > -1 ) {
			return (
				<EmptySearchRecommendedPost
					post={ post }
					postKey={ postKey }
					streamKey={ streamKey }
					fixedHeaderHeight={ this.props.fixedHeaderHeight }
					itemRef={ this.props.itemRef }
				/>
			);
		} else if ( ! post ) {
			return <PostPlaceholder itemRef={ this.props.itemRef } />;
		} else if ( post.is_error ) {
			return <PostUnavailable post={ post } itemRef={ this.props.itemRef } />;
		} else if (
			( ! post.is_external || post.is_jetpack ) &&
			includes( this.props.blockedSites, +post.site_ID )
		) {
			return <PostBlocked post={ post } itemRef={ this.props.itemRef } />;
		} else if ( isXPost( post ) ) {
			const xMetadata = XPostHelper.getXPostMetadata( post );
			return (
				<CrossPost
					{ ...omit( this.props, 'store' ) }
					xMetadata={ xMetadata }
					post={ post }
					postKey={ postKey }
				/>
			);
		}

		return <TrackedPost { ...this.props } />;
	}
}

const ConnectedPostLifecycle = connect(
	( _state, ownProps ) => {
		return {
			post: ownProps.postKey.isSynthetic ? ownProps.postKey : ownProps.post,
		};
	},
	{
		recordReaderTracksEvent,
	},
	null,
	{
		forwardRef: true,
		areOwnPropsEqual: compareProps( { ignore: [ 'handleClick' ] } ),
	}
)( PostLifecycle );

const PostLifecycleWithPost = forwardRef( function PostLifecycleWithPost( props, ref ) {
	const post = useCachedPost( props.postKey );
	return <ConnectedPostLifecycle { ...props } post={ post } ref={ ref } />;
} );

export default PostLifecycleWithPost;
