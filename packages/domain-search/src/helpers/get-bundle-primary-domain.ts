import type { BundleSuggestion, BundleSuggestionDomain } from '@automattic/api-core';

/**
 * Resolve a bundle's primary (anchor) member. Prefers the domain explicitly
 * tagged `role: 'primary'` and falls back to the first member, since `role` is
 * optional on `BundleSuggestionDomain` and older bundles omit it. Callers that
 * reach this with a non-empty `domains` array always get a member back; an
 * empty bundle yields `undefined` (mirroring `domains[ 0 ]`).
 */
export function getBundlePrimaryDomain( bundle: BundleSuggestion ): BundleSuggestionDomain {
	return bundle.domains.find( ( domain ) => domain.role === 'primary' ) ?? bundle.domains[ 0 ];
}
