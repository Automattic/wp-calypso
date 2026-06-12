/**
 * Family classification for plugins that use the unified Jetpack
 * connection flow.
 *
 * Used to drive priority-based UI decisions across the flow — titles,
 * subtitles, and the cards rendered in the connect-account features
 * section.
 */
export type Family = 'a4a' | 'woo' | 'jetpack' | 'other';

/**
 * Priority order for surfacing families in copy and feature cards.
 * A4A wins, then Woo, then Jetpack, then anything else.
 *
 * Featured cards and subtitle slot picking iterate this array, so changing
 * the order changes the entire flow's hierarchy.
 */
export const FAMILY_PRIORITY: readonly Family[] = [ 'a4a', 'woo', 'jetpack', 'other' ];

/**
 * Determine the family for a given plugin slug.
 *
 * Falls back to `'other'` for any slug that doesn't match a known family
 * prefix — unknown plugins never block the connection flow. The `'other'`
 * family is treated as the lowest priority and only surfaces a generic
 * fallback card when no known family is present.
 * @param slug Plugin slug exactly as it arrives in the `plugins` query
 *             parameter. Slugs are matched by family prefix so that future
 *             plugin additions in a known family don't require a registry
 *             update before they can be classified.
 */
export function getFamilyFromSlug( slug: string ): Family {
	if ( slug.startsWith( 'automattic' ) ) {
		return 'a4a';
	}
	if ( slug.startsWith( 'woocommerce' ) ) {
		return 'woo';
	}
	if ( slug === 'jetpack' || slug.startsWith( 'jetpack-' ) ) {
		return 'jetpack';
	}
	return 'other';
}
