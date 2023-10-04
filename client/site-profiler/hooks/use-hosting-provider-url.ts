import { useMemo } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import { HostingProvider } from 'calypso/data/site-profiler/types';

export default function useHostingProviderURL(
	type: 'support' | 'homepage' | 'login',
	hostingProvider?: HostingProvider,
	urlData?: UrlData
): string | undefined {
	return useMemo( (): string | undefined => {
		if ( type === 'support' ) {
			return urlData?.platform_data?.support_url ?? hostingProvider?.support_url ?? '';
		} else if ( type === 'homepage' ) {
			return urlData?.platform_data?.homepage_url ?? hostingProvider?.homepage_url ?? '';
		}

		return urlData?.platform === 'wordpress' && urlData?.url ? `${ urlData.url }wp-admin` : '';
	}, [ type, hostingProvider, urlData ] );
}
