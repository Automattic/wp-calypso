/**
 * External Dependencies
 */
import url from 'url';
import page from 'page';
import { isNumber } from 'lodash';

/**
 * Internal Dependencies
 */
import i18n from 'i18n-calypso';
import { state as SiteState } from 'lib/reader-site-store/constants';
import FeedDisplayHelper from 'reader/lib/feed-display-helper';
import PostStore from 'lib/feed-post-store';
import { selectItem } from 'lib/feed-stream-store/actions';
import XPostHelper, { isXPost } from 'reader/xpost-helper';
import { setLastStoreId } from 'reader/controller-helper';

export function siteNameFromSiteAndPost( site, post ) {
	let siteName;

	if ( site && ( site.title || site.domain ) ) {
		siteName = site.title || site.domain;
	} else if ( site && site.get && site.get( 'state' ) === SiteState.COMPLETE ) {
		siteName = site.get( 'title' ) || site.get( 'domain' );
	} else if ( post ) {
		if ( post.site_name ) {
			siteName = post.site_name;
		} else if ( post.site_URL ) {
			siteName = url.parse( post.site_URL ).hostname;
		}
	}

	if ( ! siteName ) {
		siteName = i18n.translate( '(no title)' );
	}

	return siteName;
}

/**
 * Creates a site-like object from a site and a post.
 *
 * Compliant with what things like the <Site /> object expects
 * @param  {Immutable.Map} site A Reader site (Immutable)
 * @param  {Object} post A Reader post
 * @return {Object}      A site like object
 */
export function siteishFromSiteAndPost( site, post ) {
	if ( site ) {
		return site.toJS();
	}

	if ( post ) {
		return {
			title: siteNameFromSiteAndPost( site, post ),
			domain: FeedDisplayHelper.formatUrlForDisplay( post.site_URL )
		};
	}

	return {
		title: '',
		domain: ''
	};
}

export function isSpecialClick( event ) {
	return event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey;
}

export function isPostNotFound( post ) {
	if ( post === undefined ) {
		return false;
	}

	return post.statusCode === 404;
}

export function showSelectedPost( { store, replaceHistory, selectedGap, postKey, index } ) {
	if ( ! postKey ) {
		return;
	}

	if ( store && isNumber( index ) ) {
		selectItem( store.getID(), index );
	} else if ( ! store ) {
		setLastStoreId( undefined );
	}

	if ( postKey.isGap === true ) {
		return selectedGap.handleClick();
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
			feed_item_ID: postKey.postId
		};
	} else {
		mappedPost = {
			site_ID: postKey.blogId,
			ID: postKey.postId
		};
	}

	showFullPost( {
		post: mappedPost,
		replaceHistory,
	} );
}

export function showFullXPost( xMetadata ) {
	if ( xMetadata.blogId && xMetadata.postId ) {
		const mappedPost = {
			site_ID: xMetadata.blogId,
			ID: xMetadata.postId
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
		page[ method ]( `/read/feeds/${ post.feed_ID }/posts/${ post.feed_item_ID }${ hashtag }${ query }` );
	} else {
		page[ method ]( `/read/blogs/${ post.site_ID }/posts/${ post.ID }${ hashtag }${ query }` );
	}
}
