import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import { SPECIAL_DOMAIN_CASES } from 'calypso/site-profiler/utils/get-special-domain-mapping';
import type { CONVERSION_ACTION } from 'calypso/site-profiler/hooks/use-define-conversion-action';

/**
 * Record analytics events for site-profiler.tsx root element only
 * The idea is to move all root element analytics events to this hook
 */
export default function useSiteProfilerRecordAnalytics(
	domain: string,
	isDomainValid?: boolean,
	conversionAction?: CONVERSION_ACTION,
	specialDomainMapping?: SPECIAL_DOMAIN_CASES
) {
	useEffect( () => {
		recordTracksEvent( 'calypso_site_profiler_page_view' );
	}, [] );

	useEffect( () => {
		domain &&
			recordTracksEvent( 'calypso_site_profiler_domain_analyze', {
				domain,
				is_domain_valid: isDomainValid,
				conversion_action: conversionAction,
				special_domain_mapping: specialDomainMapping,
			} );
	}, [ domain, isDomainValid ] );
}
