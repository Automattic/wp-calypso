import { wpcom } from '../wpcom-fetcher';
import type { SiteComment } from '../sites-comments';
import type { CreateSiteCommentReplyParams } from './types';

const commentPath = ( siteId: number, commentId: number | string ) =>
	`/sites/${ encodeURIComponent( siteId ) }/comments/${ encodeURIComponent( commentId ) }`;

export const createSiteCommentReply = async ( {
	siteId,
	parentCommentId,
	content,
}: CreateSiteCommentReplyParams ): Promise< SiteComment > =>
	wpcom.req.post(
		{
			path: `${ commentPath( siteId, parentCommentId ) }/replies/new`,
			apiVersion: '1.1',
		},
		{ content }
	);
