/**
 * Internal dependencies
 */
import type { AppState } from 'calypso/types';

const getSiteActivityLogRetentionPolicyRequestStatus = (
	state: AppState,
	siteId: number | null
): string | undefined => {
	if ( ! Number.isInteger( siteId ) ) {
		return undefined;
	}

	return state.activityLog.retentionPolicy[ siteId as number ]?.requestStatus;
};

export default getSiteActivityLogRetentionPolicyRequestStatus;
