import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import { adaptSiteSubscriptionsResponse } from './adapters';
import type { SiteSubscriptionsApiResponse, SiteSubscriptionsPage } from './types';

export const fetchReadFollows = ( {
	page = 1,
	number = 200,
	meta = '',
}: {
	page?: number;
	number?: number;
	meta?: string;
} = {} ): Promise< SiteSubscriptionsPage > =>
	wpcom.req
		.get( {
			path: addQueryArgs( '/read/following/mine', { page, number, meta } ),
			apiVersion: '1.2',
			method: 'GET',
		} )
		.then( ( response: SiteSubscriptionsApiResponse ) =>
			adaptSiteSubscriptionsResponse( response )
		);
