import 'calypso/state/data-layer/wpcom/sites/scan';
import type { AppState } from 'calypso/types';

/**
 * Returns the current Jetpack Scan request retry count for a given site.
 * Returns undefined if the site is unknown, or if no information is available.
 */
export default function getSiteScanRequestRetryCount(
	state: AppState,
	siteId: number
): number | undefined {
	return state.jetpackScan.requestStatusRetryCount?.[ siteId ];
}
