import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadPost, ReadPostBlogKey, ReadPostFeedKey, ReadPostKey } from './types';

const isBlogKey = ( postKey: ReadPostKey ): postKey is ReadPostBlogKey =>
	'blogId' in postKey && postKey.blogId != null;

const widthQuery = ( contentWidth?: number ) =>
	contentWidth ? { content_width: contentWidth } : {};

const fetchReadBlogPost = (
	{ blogId, postId }: ReadPostBlogKey,
	contentWidth?: number
): Promise< ReadPost > =>
	wpcom.req.get( {
		path: addQueryArgs(
			`/read/sites/${ encodeURIComponent( blogId ) }/posts/${ encodeURIComponent( postId ) }`,
			widthQuery( contentWidth )
		),
		apiVersion: '1.1',
		method: 'GET',
	} );

const fetchReadFeedPost = (
	{ feedId, postId, ...params }: ReadPostFeedKey,
	contentWidth?: number
): Promise< ReadPost > =>
	wpcom.req.get( {
		path: addQueryArgs(
			`/read/feed/${ encodeURIComponent( feedId ) }/posts/${ encodeURIComponent( postId ) }`,
			{ ...params, ...widthQuery( contentWidth ) }
		),
		apiVersion: '1.2',
		method: 'GET',
	} );

export const fetchReadPost = (
	postKey: ReadPostKey,
	contentWidth?: number
): Promise< ReadPost > =>
	isBlogKey( postKey )
		? fetchReadBlogPost( postKey, contentWidth )
		: fetchReadFeedPost( postKey as ReadPostFeedKey, contentWidth );
