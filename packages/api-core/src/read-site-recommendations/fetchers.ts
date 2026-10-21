import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadSiteRecommendationsQueryParams, ReadSiteRecommendationsResponse } from './types';

export const fetchReadSiteRecommendations = ( {
	number = 4,
	offset = 0,
	seed = 0,
}: ReadSiteRecommendationsQueryParams = {} ): Promise< ReadSiteRecommendationsResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/recommendations/sites', {
			number,
			offset,
			seed,
			posts_per_site: 0,
		} ),
		apiVersion: '1.2',
		method: 'GET',
	} );
