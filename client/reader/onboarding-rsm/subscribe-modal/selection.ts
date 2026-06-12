import type { CardData } from './use-subscribe-recommendations';

/**
 * Pure transition for the subscribe modal's preview-column selection: given
 * the current selection and the latest visible recommendations, return the
 * next selection — or `undefined` to signal "no change."
 *
 * Three cases:
 *   1. Recommendations is empty → clear (or `undefined` if already null).
 *   2. No current selection → pick `recommendations[ 0 ]`.
 *   3. Current selection no longer exists in recommendations (e.g. a pinned
 *      card was pruned after paginated follows revealed it was already
 *      subscribed) → repoint to `recommendations[ 0 ]`. Otherwise `undefined`.
 *
 * Extracted from the effect in `index.tsx` so the cases above can be unit
 * tested without standing up a full modal render.
 */
export function nextSelectedSite(
	current: CardData | null,
	recommendations: CardData[]
): CardData | null | undefined {
	if ( recommendations.length === 0 ) {
		return current ? null : undefined;
	}
	if ( ! current ) {
		return recommendations[ 0 ];
	}
	const stillExists = recommendations.some(
		( recommendation ) => recommendation.feed_ID === current.feed_ID
	);
	return stillExists ? undefined : recommendations[ 0 ];
}
