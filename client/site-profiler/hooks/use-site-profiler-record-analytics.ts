import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import { SPECIAL_DOMAIN_CASES } from 'calypso/site-profiler/utils/get-special-domain-mapping';
import type { UrlData } from 'calypso/blocks/import/types';
import type { HostingProvider } from 'calypso/data/site-profiler/types';
import type { CONVERSION_ACTION } from 'calypso/site-profiler/hooks/use-define-conversion-action';

/**
 * Record analytics events for site-profiler.tsx root element only
 * The idea is to move all root element analytics events to this hook
 */
export default function useSiteProfilerRecordAnalytics(
	domain: string,
	isDomainValid?: boolean,
	conversionAction?: CONVERSION_ACTION,
	specialDomainMapping?: SPECIAL_DOMAIN_CASES,
	hostingProvider?: HostingProvider,
	urlData?: UrlData
) {
	useEffect( () => {
		recordTracksEvent( 'calypso_site_profiler_page_view' );
	}, [] );

	useEffect( () => {
		domain &&
			conversionAction &&
			recordTracksEvent( 'calypso_site_profiler_domain_analyze', {
				domain,
				is_domain_valid: isDomainValid,
				conversion_action: conversionAction,
				special_domain_mapping: specialDomainMapping,
			} );
	}, [ domain, isDomainValid, conversionAction ] );

	useEffect( () => {
		hostingProvider &&
			recordTracksEvent( 'calypso_site_profiler_hosting_information_provider', {
				domain: domain,
				is_cdn: hostingProvider?.is_cdn,
				provider_slug: hostingProvider?.slug,
				provider_name: hostingProvider?.name,
			} );
	}, [ hostingProvider ] );

	useEffect( () => {
		urlData &&
			recordTracksEvent( 'calypso_site_profiler_hosting_information_url_data', {
				domain: domain,
				platform: urlData?.platform,
				platform_slug: urlData?.platform_data?.slug,
				platform_is_wpcom: urlData?.platform_data?.is_wpcom,
				platform_is_wpengine: urlData?.platform_data?.is_wpengine,
				platform_is_pressable: urlData?.platform_data?.is_pressable,
			} );
	}, [ urlData ] );
}
