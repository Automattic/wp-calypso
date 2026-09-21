import config from '@automattic/calypso-config';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import type { AppState } from 'calypso/types';

/**
 * Whether the current user can open the Stats settings: an administrator, in the wp-admin dashboard of a site whose stats-admin sends `has_stats_settings`.
 * @param state Global state tree.
 * @param siteId Site to check.
 */
export default function canManageStatsSettings( state: AppState, siteId: number | null ): boolean {
	return (
		config.isEnabled( 'is_running_in_jetpack_site' ) &&
		!! getSiteOption( state, siteId, 'has_stats_settings' ) &&
		!! canCurrentUser( state, siteId, 'manage_options' )
	);
}
