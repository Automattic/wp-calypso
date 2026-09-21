import config from '@automattic/calypso-config';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import type { AppState } from 'calypso/types';

/**
 * Whether the current user can open the Stats settings. The settings live on the site, so only
 * the wp-admin dashboard of a Jetpack site whose stats-admin serves them can show them.
 * @param state Global state tree.
 * @param siteId Site to check.
 */
export default function canManageStatsSettings( state: AppState, siteId: number | null ): boolean {
	return (
		config.isEnabled( 'is_running_in_jetpack_site' ) &&
		!! getEnvStatsFeatureSupportChecks( state, siteId ).supportsStatsSettings &&
		!! canCurrentUser( state, siteId, 'manage_options' )
	);
}
