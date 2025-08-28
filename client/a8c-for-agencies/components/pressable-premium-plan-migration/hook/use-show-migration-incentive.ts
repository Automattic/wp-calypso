import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { PRESSABLE_PREMIUM_PLAN_MIGRATION_INCENTIVE_END_DATE } from '../lib/constants';

export function useShowMigrationIncentive() {
	const isFeatureEnabled = isEnabled( 'pressable-premium-plan' );

	const agency = useSelector( getActiveAgency );
	const numberSites = agency?.signup_meta?.number_sites;

	// Show the migration incentive if the agency has 51-100 sites.
	// Also, show if the agency has not set the number of sites.
	// This is to handle old signups without the number_sites field.
	const showMigrationIncentive = numberSites === '51-100' || numberSites === '';

	// We only show the incentive if the current date is before the migration incentive end date.
	const isIncentiveActive = PRESSABLE_PREMIUM_PLAN_MIGRATION_INCENTIVE_END_DATE > new Date();

	return isFeatureEnabled && showMigrationIncentive && isIncentiveActive;
}
