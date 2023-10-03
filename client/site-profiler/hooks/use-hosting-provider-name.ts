import { useMemo } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import { HostingProvider } from 'calypso/data/site-profiler/types';

export default function useHostingProviderName(
	hostingProvider?: HostingProvider,
	urlData?: UrlData
): string | undefined {
	return useMemo( (): string | undefined => {
		const ret = urlData?.platform_data?.name ?? hostingProvider?.name ?? '';

		return ret === 'Automattic' ? 'WordPress.com' : ret;
	}, [ hostingProvider, urlData ] );
}
