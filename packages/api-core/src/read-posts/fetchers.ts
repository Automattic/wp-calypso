import { wpcom } from '../wpcom-fetcher';
import type { ReaderPost } from './types';

export const fetchReadSitePost = (
	blogId: number | string,
	postId: number | string,
	query?: Record< string, unknown >
): Promise< ReaderPost > =>
	wpcom.req.get(
		{
			path: `/read/sites/${ encodeURIComponent( blogId ) }/posts/${ encodeURIComponent( postId ) }`,
		},
		query
	);

export const fetchReadFeedPost = (
	feedId: number | string,
	postId: number | string,
	query?: Record< string, unknown >
): Promise< ReaderPost > =>
	wpcom.req.get(
		{
			path: `/read/feed/${ encodeURIComponent( feedId ) }/posts/${ encodeURIComponent( postId ) }`,
			apiVersion: '1.2',
		},
		query
	);
