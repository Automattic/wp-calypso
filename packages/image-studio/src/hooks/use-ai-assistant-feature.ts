import { dispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Jetpack's editor bundle registers this store with fail-open defaults
 * (`hasFeature: true`), so reading early can never misreport an entitled
 * site as unentitled. Nothing populates it at editor boot — the store's
 * resolver is inert because the defaults pre-fill the state, and Jetpack's
 * own surfaces only refresh it after an AI request — so when this hook is
 * enabled it owns the fetch.
 */
const PLANS_STORE = 'wordpress-com/plans';

interface AiFeatureData {
	hasFeature?: boolean;
}

interface PlansStoreSelectors {
	getAiAssistantFeature?: () => AiFeatureData | undefined;
	getIsRequestingAiAssistantFeature?: () => boolean;
}

interface UseHasAiAssistantFeatureOptions {
	/**
	 * When false, the hook reads nothing and fetches nothing, and reports
	 * entitled. Lets callers scope the (one per editor load) plans request
	 * to the surfaces that actually consume the verdict.
	 */
	enabled?: boolean;
}

// One fetch per editor session; the isRequesting claim below also covers
// Jetpack's own post-AI-request refreshes.
let fetchDispatched = false;

/**
 * Whether the site has the paid AI Assistant feature, read from Jetpack's
 * `wordpress-com/plans` store. `hasFeature` is `wpcom_site_has_feature(
 * 'ai-assistant' )` — granted by Jetpack AI plans, wpcom Personal and
 * higher, or Jetpack Complete — the same flag the video-generation server
 * gate checks. Returns false ONLY on confirmed data; disabled, store
 * absent, or data not yet loaded all fail open to true. Callers decide
 * where the result applies (e.g. site-type scoping via `enabled`).
 */
export function useHasAiAssistantFeature( {
	enabled = true,
}: UseHasAiAssistantFeatureOptions = {} ): boolean {
	const { hasFeature, isRequesting, storeAvailable } = useSelect(
		( select ) => {
			if ( ! enabled ) {
				return { hasFeature: undefined, isRequesting: false, storeAvailable: false };
			}
			const store = select( PLANS_STORE ) as PlansStoreSelectors | undefined;
			return {
				hasFeature: store?.getAiAssistantFeature?.()?.hasFeature,
				isRequesting: store?.getIsRequestingAiAssistantFeature?.() ?? false,
				storeAvailable: !! store?.getAiAssistantFeature,
			};
		},
		[ enabled ]
	);

	useEffect( () => {
		// A false hasFeature is necessarily real data (the store's default is
		// true), so there's nothing left to fetch.
		if ( hasFeature === false ) {
			return;
		}
		if ( ! storeAvailable || fetchDispatched ) {
			return;
		}
		// An in-flight request means someone else (Jetpack's own AI surfaces)
		// owns the fetch — claim the session flag so we don't dispatch a
		// redundant one when it resolves.
		if ( isRequesting ) {
			fetchDispatched = true;
			return;
		}
		const plansDispatch = dispatch( PLANS_STORE ) as
			| { fetchAiAssistantFeature?: () => void }
			| undefined;
		if ( typeof plansDispatch?.fetchAiAssistantFeature !== 'function' ) {
			return;
		}
		fetchDispatched = true;
		plansDispatch.fetchAiAssistantFeature();
	}, [ storeAvailable, isRequesting, hasFeature ] );

	return hasFeature !== false;
}
