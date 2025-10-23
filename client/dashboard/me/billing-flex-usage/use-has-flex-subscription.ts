// import type { Purchase } from '@automattic/api-core';

/**
 * Temporary eligibility hook for showing Flex usage UI.
 * Returns true for now; replace with real checks later.
 */
export function useHasFlexSubscription( /* purchase?: Purchase */ ): boolean {
	return true;
}

export default useHasFlexSubscription;
