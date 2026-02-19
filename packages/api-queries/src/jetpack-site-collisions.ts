import { fetchJetpackSiteUrls } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

function withoutHttp( url: string ): string {
	return url.replace( /^https?:\/\//, '' );
}

export const jetpackSiteUrlsQuery = () =>
	queryOptions( {
		queryKey: [ 'jetpack-site-urls' ],
		queryFn: async () => {
			const urls = await fetchJetpackSiteUrls();
			return urls.map( withoutHttp );
		},
	} );
