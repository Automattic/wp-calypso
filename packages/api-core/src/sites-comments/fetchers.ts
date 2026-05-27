import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { SiteComment, SiteCommentQueryParams } from './types';

const commentPath = ( siteId: number, commentId: number | string ) =>
	`/sites/${ encodeURIComponent( siteId ) }/comments/${ encodeURIComponent( commentId ) }`;

export const fetchSiteComment = async ( {
	siteId,
	commentId,
}: SiteCommentQueryParams ): Promise< SiteComment > =>
	wpcom.req.get( {
		path: addQueryArgs( commentPath( siteId, commentId ), {
			author_wpcom_data: true,
			force: 'wpcom',
		} ),
		apiVersion: '1.1',
		method: 'GET',
	} );
