import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { PRESSABLE_PREMIUM_PLAN_MIGRATION_INCENTIVE_END_DATE } from '../lib/constants';

const MIN_SITES_FOR_INCENTIVE = 50;

const isMoreThanMinSites = ( sites?: string ) => {
	if ( ! sites || sites === '' ) {
		return false;
	}

	// Handle the "500+" case
	if ( sites.includes( '+' ) ) {
		const baseNumber = parseInt( sites.replace( '+', '' ) );
		return baseNumber > MIN_SITES_FOR_INCENTIVE;
	}

	// Handle range cases like "51-100", "101-500"
	if ( sites.includes( '-' ) ) {
		const [ min ] = sites.split( '-' ).map( ( num ) => parseInt( num ) );
		return min > MIN_SITES_FOR_INCENTIVE;
	}
};

export function useShowMigrationIncentive() {
	const agency = useSelector( getActiveAgency );
	const numberSites = agency?.signup_meta?.number_sites;

	// Show the migration incentive if the agency has more than MIN_SITES_FOR_INCENTIVE.
	// Also, show if the agency has not set the number of sites.
	// This is to handle old signups without the number_sites field.
	const showMigrationIncentive = isMoreThanMinSites( numberSites ) || numberSites === '';

	// We only show the incentive if the current date is before the migration incentive end date.
	const isIncentiveActive = PRESSABLE_PREMIUM_PLAN_MIGRATION_INCENTIVE_END_DATE > new Date();

	return showMigrationIncentive && isIncentiveActive;
}
