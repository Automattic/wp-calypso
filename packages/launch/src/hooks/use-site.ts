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

	const [ site, isSiteLaunched, isSiteLaunching, isLoading ] = useSelect(
		( select ) => {
			const siteStore = select( SITE_STORE );

			return [
				siteStore.getSite( siteId ),
				siteStore.isSiteLaunched( siteId ),
				siteStore.isSiteLaunching( siteId ),
				siteStore.isFetchingSiteDetails(),
			];
		},
		[ siteId ]
	);

	return {
		sitePlan: site?.plan,
		hasPaidPlan: site && ! site.plan?.is_free, // sometimes plan will not be available: https://github.com/Automattic/wp-calypso/pull/44895
		isSiteLaunched,
		isSiteLaunching,
		selectedFeatures: site?.options?.selected_features,
		isLoadingSite: !! isLoading,
	};
}
