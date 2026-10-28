import {
	agencySitesWithPluginsQuery,
	referralsQuery,
	wooPaymentsLicensesQuery,
	WOOPAYMENTS_PLUGIN,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import useFetchTaggedSitesForMigration from './migrations/hooks/use-fetch-tagged-sites-for-migration';

// Keeps the payout notice away from agencies with nothing to be paid for.
export function useHasCommissionActivity( agencyId: number ) {
	const enabled = !! agencyId;
	const { data: referrals, isLoading: isLoadingReferrals } = useQuery( {
		...referralsQuery( agencyId ),
		enabled,
		refetchOnWindowFocus: false,
	} );
	const { data: taggedSites, isLoading: isLoadingMigrations } = useFetchTaggedSitesForMigration();
	const { data: wooPaymentsLicenses, isLoading: isLoadingLicenses } = useQuery( {
		...wooPaymentsLicensesQuery( agencyId ),
		enabled,
		refetchOnWindowFocus: false,
	} );
	const { data: wooPaymentsSites, isLoading: isLoadingSites } = useQuery( {
		...agencySitesWithPluginsQuery( agencyId, [ WOOPAYMENTS_PLUGIN ] ),
		enabled,
		refetchOnWindowFocus: false,
	} );

	const isLoading =
		! enabled || isLoadingReferrals || isLoadingMigrations || isLoadingLicenses || isLoadingSites;

	return {
		hasActivity:
			!! referrals?.length ||
			!! taggedSites?.length ||
			!! wooPaymentsLicenses?.length ||
			!! wooPaymentsSites?.length,
		isLoading,
	};
}
