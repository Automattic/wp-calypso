import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { SitePostRepliesQueryParams, SitePostRepliesResponse } from './types';

const DEFAULT_COMMENTS_PER_REQUEST = 50;

const postRepliesPath = ( siteId: number, postId: number ) =>
	`/sites/${ encodeURIComponent( siteId ) }/posts/${ encodeURIComponent( postId ) }/replies`;

export const fetchSitePostReplies = async ( {
	siteId,
	postId,
	status = 'approved',
	order = 'DESC',
	number = DEFAULT_COMMENTS_PER_REQUEST,
	before,
	after,
	offset,
}: SitePostRepliesQueryParams ): Promise< SitePostRepliesResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( postRepliesPath( siteId, postId ), {
			number,
			status,
			order,
			author_wpcom_data: true,
			force: 'wpcom',
			before,
			after,
			offset,
		} ),
		apiVersion: '1.1',
		method: 'GET',
	} );
