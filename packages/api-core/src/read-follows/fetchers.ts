import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import { adaptFollowsResponse } from './adapters';
import type { FollowsApiResponse, FollowsPage } from './types';

export const fetchFollowsPage = ( {
	page = 1,
	number = 200,
	meta = '',
}: {
	page?: number;
	number?: number;
	meta?: string;
} = {} ): Promise< FollowsPage > =>
	wpcom.req
		.get( {
			path: addQueryArgs( '/read/following/mine', { page, number, meta } ),
			apiVersion: '1.2',
			method: 'GET',
		} )
		.then( ( response: FollowsApiResponse ) => adaptFollowsResponse( response ) );
