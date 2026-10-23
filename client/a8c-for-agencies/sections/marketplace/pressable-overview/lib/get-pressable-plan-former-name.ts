// Pressable renamed Signature and Premium to Standard, Agency and Performance on 2026-10-07.
// After this date, the "renamed plan" note is no longer shown.
export const PRESSABLE_PLAN_RENAME_NOTE_END_DATE = new Date( '2027-01-07T00:00:00Z' );

const RENAMED_PLAN_SLUG = /^pressable-(signature|premium)-(\d+)$/;

const RENAMED_TIERS: Record< string, { formerName: string; lastTier: number } > = {
	signature: { formerName: 'Pressable Signature', lastTier: 17 },
	premium: { formerName: 'Pressable Premium', lastTier: 11 },
};

/**
 * The name a renamed Pressable plan had before the rename, e.g. "Pressable Signature 2".
 * Undefined for plans that were not renamed, including the legacy bare `pressable-premium`.
 */
export function getPressablePlanFormerName( slug: string ): string | undefined {
	const match = slug.match( RENAMED_PLAN_SLUG );
	if ( ! match ) {
		return undefined;
	}

	const { formerName, lastTier } = RENAMED_TIERS[ match[ 1 ] ];
	const tier = Number( match[ 2 ] );
	return tier >= 1 && tier <= lastTier ? `${ formerName } ${ tier }` : undefined;
}

/**
 * The former name to explain next to an existing plan, or undefined when there is nothing to explain:
 * the plan was not renamed, the products API still returns the old name, or the note has expired.
 */
export function getPressablePlanRenameNote(
	plan: { slug: string; name: string },
	now: Date = new Date()
): string | undefined {
	if ( now >= PRESSABLE_PLAN_RENAME_NOTE_END_DATE ) {
		return undefined;
	}

	const formerName = getPressablePlanFormerName( plan.slug );
	return formerName && formerName !== plan.name ? formerName : undefined;
}
