/**
 * Internal Dependencies
 */
import { HostingProviderUrlDetails } from 'calypso/data/site-profiler/types';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import useHostingProviderName from 'calypso/site-profiler/hooks/use-hosting-provider-name';

interface HostingProviderUrlDetailsResult {
	data: HostingProviderUrlDetails;
	isLoading: boolean;
}

export const useHostingProviderUrlDetails = ( url: string ): HostingProviderUrlDetailsResult => {
	let domain = '';
	try {
		domain = new URL( url )?.hostname;
	} catch ( e ) {}

	const { data: urlData, isLoading: isLoadingAnalyzeUrl } = useAnalyzeUrlQuery( url, true );
	const { data: hostingProviderData, isLoading: isLoadingHostingProvider } =
		useHostingProviderQuery( domain, true );

	const name = useHostingProviderName( hostingProviderData?.hosting_provider, urlData );
	const slug = hostingProviderData?.hosting_provider?.slug || 'unknown';

	return {
		data: {
			name,
			is_a8c: slug === 'automattic',
			is_unknown: slug === 'unknown',
			hosting_provider: hostingProviderData?.hosting_provider,
			url_data: urlData,
		},
		isLoading: isLoadingAnalyzeUrl || isLoadingHostingProvider,
	};
};
