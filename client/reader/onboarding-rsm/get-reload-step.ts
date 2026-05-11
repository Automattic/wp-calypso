type Step = 'welcome' | 'interests' | 'discover';

/** Maps each reload query-param name to the onboarding step it should reopen. */
const RELOAD_PARAM_TO_STEP: Record< string, Step > = {
	reloadSubscriptionOnboarding: 'discover',
	reloadInterestsOnboarding: 'interests',
};

/**
 * Inspects a URL search string for a known reload param and returns the step
 * to open along with the cleaned search string (param removed).
 * Returns null when no recognised param is present.
 */
export function getReloadStep( search: string ): { step: Step; cleanedSearch: string } | null {
	const urlParams = new URLSearchParams( search );

	for ( const [ param, step ] of Object.entries( RELOAD_PARAM_TO_STEP ) ) {
		if ( urlParams.has( param ) ) {
			urlParams.delete( param );
			return { step, cleanedSearch: urlParams.toString() };
		}
	}

	return null;
}
