import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

/**
 * Allow only one migration trial site per user
 * - a8c team members are allowed to have more than one.
 * - user with a flag are allowed to have more than one.
 */
export function useSiteEligibleMigrationTrialPlan(): boolean {
	const user = useSelector( getCurrentUser );
	const flags = user?.meta?.data?.flags?.active_flags || [];

	return isEnabled( 'plans/migration-trial' ) && flags.includes( 'allow_multiple_business_trials' );
}
