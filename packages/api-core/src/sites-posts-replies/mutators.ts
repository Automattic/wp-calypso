import { wpcom } from '../wpcom-fetcher';
import type { SiteComment } from '../sites-comments';
import type { CreateSitePostReplyParams } from './types';

const postRepliesPath = ( siteId: number, postId: number ) =>
	`/sites/${ encodeURIComponent( siteId ) }/posts/${ encodeURIComponent( postId ) }/replies`;

export const createSitePostReply = async ( {
	siteId,
	postId,
	content,
}: CreateSitePostReplyParams ): Promise< SiteComment > =>
	wpcom.req.post(
		{
			path: `${ postRepliesPath( siteId, postId ) }/new`,
			apiVersion: '1.1',
		},
		{ content }
	);
