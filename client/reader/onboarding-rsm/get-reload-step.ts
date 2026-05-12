type Step = 'welcome' | 'interests' | 'discover';

/**
 * Maps each reload query-param name to the onboarding step it should reopen.
 * `as const satisfies` preserves the literal key types so `ReloadParam` below
 * is a precise union rather than `string`, keeping callers and this map in sync.
 */
const RELOAD_PARAM_TO_STEP = {
	reloadSubscriptionOnboarding: 'discover',
	reloadInterestsOnboarding: 'interests',
} as const satisfies Record< string, Step >;

/** Union of the recognised reload query-param names. */
export type ReloadParam = keyof typeof RELOAD_PARAM_TO_STEP;

/**
 * Inspects a URL search string for a known reload param and returns the step
 * to open along with the cleaned search string (param removed).
 * Returns null when no recognised param is present.
 */
export function getReloadStep( search: string ): { step: Step; cleanedSearch: string } | null {
	const urlParams = new URLSearchParams( search );

	for ( const [ param, step ] of Object.entries( RELOAD_PARAM_TO_STEP ) as Array<
		[ ReloadParam, Step ]
	> ) {
		if ( urlParams.has( param ) ) {
			urlParams.delete( param );
			return { step, cleanedSearch: urlParams.toString() };
		}
	}

	return null;
}
