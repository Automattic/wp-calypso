import { isEnabled } from '@automattic/calypso-config';
import { isMigrationTrialSite } from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import isA8cTeamMember from 'calypso/state/teams/selectors/is-a8c-team-member';

/**
 * Allow only one migration trial site per user.
 * A8c team members are allowed to have more than one.
 */
export function useSiteEligibleMigrationTrialPlan(): boolean {
	const isA8c = useSelector( isA8cTeamMember );
	const sites = useSelector( getSites );
	const trialSites = sites.filter( ( site ) => site && isMigrationTrialSite( site ) ) || [];

	if ( ! isEnabled( 'plans/migration-trial' ) ) {
		return false;
	}

	return isA8c || ! ( trialSites.length > 0 );
}
