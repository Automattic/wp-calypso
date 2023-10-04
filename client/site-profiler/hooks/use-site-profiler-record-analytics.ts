import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import type { CONVERSION_ACTION } from 'calypso/site-profiler/hooks/use-define-conversion-action';

/**
 * Record analytics events for site-profiler.tsx root element only
 * The idea is to move all root element analytics events to this hook
 */
export default function useSiteProfilerRecordAnalytics(
	domain: string,
	isDomainValid?: boolean,
	conversionAction?: CONVERSION_ACTION
) {
	useEffect( () => {
		recordTracksEvent( 'calypso_site_profiler_page_view' );
	}, [] );

	useEffect( () => {
		domain &&
			isDomainValid &&
			recordTracksEvent( 'calypso_site_profiler_domain_analyze', {
				domain,
				conversion_action: conversionAction,
			} );
	}, [ domain, isDomainValid ] );
}
