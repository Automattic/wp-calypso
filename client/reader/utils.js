/** @format */
/**
 * External Dependencies
 */
import page from 'page';
import { every } from 'lodash';

/**
 * Internal Dependencies
 */
import XPostHelper, { isXPost } from 'reader/xpost-helper';
import { reduxGetState } from 'lib/redux-bridge';
import { getPostByKey } from 'state/reader/posts/selectors';

export function isSpecialClick( event ) {
	return event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey;
}

export function isPostNotFound( post ) {
	if ( post === undefined ) {
		return false;
	}

	return post.statusCode === 404;
}

export function showSelectedPost( { replaceHistory, postKey, comments } ) {
	if ( ! postKey ) {
		return;
	}

	// rec block
	if ( postKey.isRecommendationBlock ) {
		return;
	}

	const post = getPostByKey( reduxGetState(), postKey );

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
