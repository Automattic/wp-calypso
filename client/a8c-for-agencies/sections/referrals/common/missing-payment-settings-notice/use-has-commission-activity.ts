import useFetchAllLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-all-licenses';
import useFetchSitesWithPlugins from 'calypso/a8c-for-agencies/data/sites/use-fetch-sites-with-plugins';
import useFetchTaggedSitesForMigration from 'calypso/a8c-for-agencies/sections/migrations/hooks/use-fetch-tagged-sites-for-migration';
import {
	LicenseFilter,
	LicenseSortField,
	LicenseSortDirection,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import useFetchReferrals from '../../hooks/use-fetch-referrals';

/**
 * Determines whether the agency has performed any commission-generating
 * activity: sent a referral, migrated a site, or set up WooPayments.
 *
 * Used to gate the "add payout information" notice so it doesn't clutter
 * the UI for brand-new accounts that have no context for it yet.
 */
export default function useHasCommissionActivity() {
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
		isLoadingReferrals || isLoadingMigrations || isLoadingLicenses || isLoadingSitesWithPlugin;

	const hasReferrals = !! referrals?.length;
	const hasMigratedSites = !! taggedSites?.length;
	const hasWooPayments =
		!! woopaymentsLicenses?.items?.length || !! sitesWithWooPaymentsPlugin?.length;

	return {
		hasActivity: hasReferrals || hasMigratedSites || hasWooPayments,
		isLoading,
	};
}
