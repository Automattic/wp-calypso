import { WPCOM_FEATURES_BACKUPS_SELF_SERVE } from '@automattic/calypso-products';
import { AppState } from 'calypso/types';
import siteHasFeature from './site-has-feature';

/**
 * Returns activity log groups that should be hidden for the given site.
 * Sites without self-serve backup access shouldn't see backup/scan events.
 * @param state - Global state tree
 * @param siteId - The site ID
 * @returns Array of group names to hide, or undefined if none should be hidden
 */
export default function getActivityLogHiddenGroups(
	state: AppState,
	siteId: number | null
): string[] | undefined {
	if ( ! siteId ) {
		return undefined;
	}

	const hasBackupsSelfServe = siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS_SELF_SERVE );
	return hasBackupsSelfServe ? undefined : [ 'rewind', 'scan' ];
}
