import { decodeEntities } from '@wordpress/html-entities';
import { wpcom } from '../wpcom-fetcher';
import type { UserLastDraft, UserLastDraftResponse } from './types';

export async function fetchUserLastDraft( userId: number ): Promise< UserLastDraft | null > {
	const response = ( await wpcom.req.get( '/me/posts', {
		author: userId,
		status: 'draft',
		type: 'post',
		order_by: 'modified',
		order: 'DESC',
		number: 1,
		fields: 'ID,site_ID,title',
	} ) ) as UserLastDraftResponse;
	const post = response.posts?.[ 0 ];

	if ( ! post?.ID || ! post.site_ID ) {
		return null;
	}

	return {
		id: post.ID,
		siteId: post.site_ID,
		title: decodeEntities( ( post.title ?? '' ).replace( /<[^>]*>/g, '' ) ).trim(),
	};
}
