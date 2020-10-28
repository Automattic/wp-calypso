/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { Site } from '@automattic/data-stores';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}

export function useSite() {
	const site = useSelect( ( select ) => select( Site.STORE_KEY ).getSite( window._currentSiteId ) );
	const launchStatus = useSelect( ( select ) =>
		select( Site.STORE_KEY ).isLaunched( window._currentSiteId )
	);

	return {
		isPaidPlan: site && ! site.plan?.is_free, // sometimes plan will not be available: https://github.com/Automattic/wp-calypso/pull/44895
		launchStatus,
		currentDomainName: site?.URL && new URL( site?.URL ).hostname,
		selectedFeatures: site?.options?.selected_features,
	};
}
