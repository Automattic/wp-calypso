import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import { HostingProvider } from 'calypso/data/site-profiler/types';

export default function useHostingProviderName(
	hostingProvider?: HostingProvider,
	urlData?: UrlData
): string {
	const translate = useTranslate();

	return useMemo( (): string => {
		// Translators: "Unknown" stands for "Unknown hosting provider"
		const ret = urlData?.platform_data?.name ?? hostingProvider?.name ?? translate( 'Unknown' );

		return ret === 'Automattic' ? 'WordPress.com' : ret;
	}, [ translate, hostingProvider, urlData ] );
}
