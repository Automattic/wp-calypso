import { useMemo } from 'react';
import type { BoundaryInsets } from '../types';
import { resolveBoundaryInset } from '../utils/constants';

/**
 * Resolve the `boundaryInset` prop into a referentially stable per-side
 * insets object. Consumers typically pass an inline object, so memoize on the
 * resolved primitive values — otherwise every render would churn the identity
 * and re-fire the hooks/effects that depend on it.
 *
 * @param inset - The consumer-supplied boundaryInset prop
 * @return The resolved, identity-stable per-side insets
 */
export function useBoundaryInsets(
	inset?: number | Partial< BoundaryInsets >
): BoundaryInsets {
	const resolved = resolveBoundaryInset( inset );
	return useMemo(
		() => resolved,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ resolved.top, resolved.right, resolved.bottom, resolved.left ]
	);
}
