import { useSelect } from '@wordpress/data';
import { useContext } from 'react';
import LaunchContext from '../context';
import { SITE_STORE } from '../stores';
import type { SiteSelect } from '@automattic/data-stores';

export function useSite() {
	const { siteId } = useContext( LaunchContext );

	const { site, isSiteLaunched, isSiteLaunching, isLoading } = useSelect(
		( select ) => {
			const siteStore: SiteSelect = select( SITE_STORE );

			return {
				site: siteStore.getSite( siteId ),
				isSiteLaunched: siteStore.isSiteLaunched( siteId ),
				isSiteLaunching: siteStore.isSiteLaunching( siteId ),
				isLoading: siteStore.isFetchingSiteDetails(),
			};
		},
		[ siteId ]
	);

	return {
		sitePlan: site && site?.plan,
		hasPaidPlan: site && ! site.plan?.is_free, // sometimes plan will not be available: https://github.com/Automattic/wp-calypso/pull/44895
		isSiteLaunched,
		isSiteLaunching,
		selectedFeatures: site?.options?.selected_features,
		isLoadingSite: !! isLoading,
	};
}
