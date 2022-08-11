import getTrackingPrefs from './get-tracking-prefs';

/**
 * Returns a boolean telling whether we may track the current user.
 *
 * WARNING: this function only works on the client side.
 *
 * @returns Whether we may track the current user
 */
export default function mayWeTrackCurrentUser(
	bucket: 'analytics' | 'advertising' | 'essential' = 'essential'
): boolean {
	const prefs = getTrackingPrefs();
	return prefs.ok && prefs.buckets[ bucket ];
}
