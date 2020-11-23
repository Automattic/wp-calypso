/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { SITE_STORE } from '../stores';
import LaunchContext from '../context';

export function useSite() {
	const { siteId } = React.useContext( LaunchContext );
	const site = useSelect( ( select ) => select( SITE_STORE ).getSite( siteId ) );
	const isLaunched = useSelect( ( select ) => select( SITE_STORE ).isLaunched( siteId ) );
	const isSiteLaunching = useSelect( ( select ) => select( SITE_STORE ).isSiteLaunching( siteId ) );
	const isLoading = useSelect( ( select ) => select( SITE_STORE ).isFetchingSiteDetails() );

	return {
		sitePlan: site?.plan,
		isPaidPlan: site && ! site.plan?.is_free, // sometimes plan will not be available: https://github.com/Automattic/wp-calypso/pull/44895
		isLaunched,
		isSiteLaunching,
		currentDomainName: site?.URL && new URL( site?.URL ).hostname,
		selectedFeatures: site?.options?.selected_features,
		isLoadingSite: !! isLoading,
	};
}
