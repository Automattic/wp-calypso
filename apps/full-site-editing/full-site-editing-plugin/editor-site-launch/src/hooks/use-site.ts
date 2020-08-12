/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * External dependencies
 */
import { SITE_STORE } from '../stores';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}

export function useSite() {
	const site = useSelect( ( select ) => select( SITE_STORE ).getSite( window._currentSiteId ) );
	const launchStatus = useSelect( ( select ) =>
		select( SITE_STORE ).isLaunched( window._currentSiteId )
	);

	return {
		isFreePlan: site?.plan.is_free,
		launchStatus,
		siteName: site?.name,
		currentDomainName: site?.URL && new URL( site?.URL ).hostname,
	};
}
