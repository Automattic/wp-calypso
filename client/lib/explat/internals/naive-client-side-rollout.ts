/**
 * Internal dependencies
 */
import user from 'calypso/lib/user';

/**
 * Naively ship a feature to a percentage of our users.
 * - Very basic, this exists to replace the last remaining calypso-abtest use-case.
 * - Works best for logged-in users.
 * - Uses randomisation for logged out users.
 * - Won't work across the log-in boundary.
 *
 * @param _featureId The unique identifier of the feature being rolled out, not currently used but important for keeping track of the features.
 * @param percentage 0-100
 * @returns Boolean of whether the user should have the feature enabled, i.e. true = rolled out, false = not rolled out.
 */
export default function naiveClientSideRollout( _featureId: string, percentage: number ): boolean {
	const maybeUserId = user()?.get()?.ID;

	// zero-indexed buckets: 0-99
	let bucket;
	if ( maybeUserId ) {
		bucket = Number( maybeUserId ) % 100;
	} else {
		bucket = Math.random() * 100;
	}

	return bucket < percentage;
}
