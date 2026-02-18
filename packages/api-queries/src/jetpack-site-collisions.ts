import { fetchJetpackSiteUrls } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import { withoutHttp } from './site-collision-listener';

export const jetpackSiteUrlsQuery = () =>
	queryOptions( {
		queryKey: [ 'jetpack-site-urls' ],
		queryFn: async () => {
			const urls = await fetchJetpackSiteUrls();
			return urls.map( withoutHttp );
		},
	} );
