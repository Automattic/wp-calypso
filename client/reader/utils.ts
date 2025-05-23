import page from '@automattic/calypso-router';
import { safeImageUrl, getUrlParts } from '@automattic/calypso-url';
import { addQueryArgs, getQueryArgs, removeQueryArgs } from '@wordpress/url';
import { Dispatch } from 'redux';
import XPostHelper, { isXPost } from 'calypso/reader/xpost-helper';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { AppState } from 'calypso/types';

interface ShowSelectedPostArgs {
	postKey?: {
		blogId?: number;
		postId: number;
		feedId?: number;
		isRecommendationBlock?: boolean;
	};
	comments?: boolean;
}

export function showSelectedPost( { postKey, comments }: ShowSelectedPostArgs ) {
	return ( _dispatch: Dispatch, getState: () => AppState ): Window | null | void => {
		if ( ! postKey ) {
			return;
		}

		// rec block
		if ( postKey.isRecommendationBlock ) {
			return;
		}

		const post = getPostByKey( getState(), postKey );

		if ( isXPost( post ) ) {
			return showFullXPost( XPostHelper.getXPostMetadata( post ) as ShowFullXPostArgs );
		}

		// normal
		let mappedPost;
		if ( postKey.feedId ) {
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
			comments,
		} );
	};
}

interface ShowFullXPostArgs {
	blogId: number;
	postId: number;
	postURL: string;
	siteURL: string;
	commentURL: string;
}

export function showFullXPost( xMetadata: ShowFullXPostArgs ): void {
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

interface ShowFullPostArgs {
	post: {
		feed_ID?: number;
		feed_item_ID?: number;
		ID?: number;
		site_ID?: number;
		referral?: {
			blogId: number;
			postId: number;
		};
	};
	comments?: boolean;
}

export function showFullPost( { post, comments }: ShowFullPostArgs ) {
	const hashtag = comments ? '#comments' : '';
	let query = '';
	if ( post.referral ) {
		const { blogId, postId } = post.referral;
		query += `ref_blog=${ blogId }&ref_post=${ postId }`;
	}

	if ( post.feed_ID && post.feed_item_ID ) {
		page( `/reader/feeds/${ post.feed_ID }/posts/${ post.feed_item_ID }${ hashtag }${ query }` );
	} else {
		page( `/reader/blogs/${ post.site_ID }/posts/${ post.ID }${ hashtag }${ query }` );
	}
}

export function getStreamType( streamKey: string ): string {
	const indexOfColon = streamKey.indexOf( ':' );
	const streamType = indexOfColon === -1 ? streamKey : streamKey.substring( 0, indexOfColon );
	return streamType;
}

/**
 * Wrapper around `safeImageUrl` of '@automattic/calypso-url' to be used in the reader.
 * There are some places in the reader where we need to show images from trusted hosts without running them through Photon.
 */
export function getSafeImageUrlForReader( url: string ): string {
	const parsedUrl = getUrlParts( url );
	// Hosts that are trusted to serve images.
	const TRUSTED_HOSTS = [ 'www.redditstatic.com' ];

	if ( TRUSTED_HOSTS.includes( parsedUrl.hostname ) ) {
		return url;
	}

	return safeImageUrl( url ) ?? '';
}

export const SEARCH_QUERY_PARAM: string = 's';

export function getUrlQuerySearchTerm( pathname: string = '' ): string {
	// If a pathname is provided, make sure that we get search key only for the given page. Prevents situation where we get search key from a different page.
	if ( pathname && location.pathname !== pathname ) {
		return '';
	}

	const queryArgs = getQueryArgs( window.location.href );
	return ( queryArgs[ SEARCH_QUERY_PARAM ] as string ) ?? '';
}

export function setUrlQuery( key: string, value: string, pathname: string = '' ): void {
	// If a pathname is provided, make sure that we set search key only for the given page. Prevents situation where we set search key for a different page.
	if ( pathname && location.pathname !== pathname ) {
		return;
	}

	const path = window.location.pathname + window.location.search;
	const nextPath = ! value
		? removeQueryArgs( path, key )
		: addQueryArgs( path, { [ key ]: value } );

	// Only trigger a page show when path has changed.
	if ( nextPath !== path ) {
		page.replace( nextPath );
	}
}
