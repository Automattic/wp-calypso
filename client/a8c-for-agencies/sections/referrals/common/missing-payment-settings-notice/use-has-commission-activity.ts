import useFetchAllLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-all-licenses';
import useFetchSitesWithPlugins from 'calypso/a8c-for-agencies/data/sites/use-fetch-sites-with-plugins';
import useFetchTaggedSitesForMigration from 'calypso/dashboard/agency/earn/migrations/hooks/use-fetch-tagged-sites-for-migration';
import {
	LicenseFilter,
	LicenseSortField,
	LicenseSortDirection,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import useFetchReferrals from '../../hooks/use-fetch-referrals';

/**
 * Determines whether the agency has performed any commission-generating
 * activity: sent a referral, migrated a site, or set up WooPayments.
 *
 * Used to gate the "add payout information" notice so it doesn't clutter
 * the UI for brand-new accounts that have no context for it yet.
 */
export default function useHasCommissionActivity() {
	const agencyId = useSelector( getActiveAgencyId );

	const { data: referrals, isLoading: isLoadingReferrals } = useFetchReferrals();

	const { data: taggedSites, isLoading: isLoadingMigrations } = useFetchTaggedSitesForMigration();

	const { data: woopaymentsLicenses, isLoading: isLoadingLicenses } = useFetchAllLicenses(
		LicenseFilter.Attached,
		'woopayments',
		LicenseSortField.IssuedAt,
		LicenseSortDirection.Descending
	);

	const { data: sitesWithWooPaymentsPlugin, isLoading: isLoadingSitesWithPlugin } =
		useFetchSitesWithPlugins( [ 'woocommerce-payments/woocommerce-payments' ] );

	const isLoading =
		// The migration activity query is gated on the agency id, so treat the
		// state as loading until it resolves — otherwise `hasMigratedSites` reads
		// false too early and the notice can flash for agencies that do have activity.
		! agencyId ||
		isLoadingReferrals ||
		isLoadingMigrations ||
		isLoadingLicenses ||
		isLoadingSitesWithPlugin;

	const hasReferrals = !! referrals?.length;
	const hasMigratedSites = !! taggedSites?.length;
	const hasWooPayments =
		!! woopaymentsLicenses?.items?.length || !! sitesWithWooPaymentsPlugin?.length;

	return {
		hasActivity: hasReferrals || hasMigratedSites || hasWooPayments,
		isLoading,
	};
}
