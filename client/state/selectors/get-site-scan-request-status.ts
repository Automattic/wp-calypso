import 'calypso/state/data-layer/wpcom/sites/scan';
import type { AppState } from 'calypso/types';

export type ScanRequestStatus = 'pending' | 'success' | 'failed';

/**
 * Returns the current Jetpack Scan request status for a given site.
 * Returns undefined if the site is unknown, or if no information is available.
 */
export default function getSiteScanRequestStatus(
	state: AppState,
	siteId: number
): ScanRequestStatus | undefined {
	return state.jetpackScan.requestStatus?.[ siteId ];
}
