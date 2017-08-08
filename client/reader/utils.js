/** @format */
/**
 * External Dependencies
 */
import page from 'page';
import { every } from 'lodash';

/**
 * Internal Dependencies
 */
import PostStore from 'lib/feed-post-store';
import XPostHelper, { isXPost } from 'reader/xpost-helper';
import { setLastStoreId } from 'reader/controller-helper';
import { fillGap } from 'lib/feed-stream-store/actions';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

export function isSpecialClick( event ) {
	return event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey;
}

export function isPostNotFound( post ) {
	if ( post === undefined ) {
		return false;
	}

	return post.statusCode === 404;
}

export function showSelectedPost( { store, replaceHistory, postKey, comments } ) {
	if ( ! postKey ) {
		return;
	}

	setLastStoreId( store && store.id );

	if ( postKey.isGap === true ) {
		return handleGapClicked( postKey, store.id );
	}

	// rec block
	if ( postKey.isRecommendationBlock ) {
		return;
	}

	const post = PostStore.get( postKey );

	if ( isXPost( post ) && ! replaceHistory ) {
		return showFullXPost( XPostHelper.getXPostMetadata( post ) );
	}

	// normal
	let mappedPost;
	if ( !! postKey.feedId ) {
		mappedPost = {
			feed_ID: postKey.feedId,
			feed_item_ID: postKey.postId,
		};
	} else {
		mappedPost = {
			site_ID: postKey.blogId,
			ID: postKey.postId,
		};
	}

	showFullPost( {
		post: mappedPost,
		replaceHistory,
		comments,
	} );
}

export function showFullXPost( xMetadata ) {
	if ( xMetadata.blogId && xMetadata.postId ) {
		const mappedPost = {
			site_ID: xMetadata.blogId,
			ID: xMetadata.postId,
		};

		showFullPost( {
			post: mappedPost,
		} );
	} else {
		window.open( xMetadata.postURL );
	}
}

export function handleGapClicked( postKey, storeId ) {
	if ( ! postKey || ! postKey.isGap || ! storeId ) {
		return;
	}

	fillGap( storeId, postKey );
	recordAction( 'fill_gap' );
	recordGaEvent( 'Clicked Fill Gap' );
	recordTrack( 'calypso_reader_filled_gap', { stream: storeId } );
}

export function showFullPost( { post, replaceHistory, comments } ) {
	const hashtag = comments ? '#comments' : '';
	let query = '';
	if ( post.referral ) {
		const { blogId, postId } = post.referral;
		query += `ref_blog=${ blogId }&ref_post=${ postId }`;
	}

	const method = replaceHistory ? 'replace' : 'show';
	if ( post.feed_ID && post.feed_item_ID ) {
		page[ method ](
			`/read/feeds/${ post.feed_ID }/posts/${ post.feed_item_ID }${ hashtag }${ query }`
		);
	} else {
		page[ method ]( `/read/blogs/${ post.site_ID }/posts/${ post.ID }${ hashtag }${ query }` );
	}
}

export const shallowEquals = ( o1, o2 ) =>
	every( Object.keys( o1 ), key => o1[ key ] === o2[ key ] );
