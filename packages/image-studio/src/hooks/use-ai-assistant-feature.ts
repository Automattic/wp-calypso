import { dispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Jetpack's editor bundle registers this store and its AI Assistant
 * extensions populate it. Its default state fails open (`hasFeature: true`
 * until real data arrives), so reading early can never misreport an
 * entitled site as unentitled.
 */
const PLANS_STORE = 'wordpress-com/plans';

interface AiFeatureData {
	hasFeature?: boolean;
}

interface PlansStoreSelectors {
	getAiAssistantFeature?: () => AiFeatureData | undefined;
	getIsRequestingAiAssistantFeature?: () => boolean;
}

// One fetch per editor session, deduped against Jetpack's own AI nudges via
// the store's isRequesting flag.
let fetchDispatched = false;

/**
 * Whether the site has the paid AI Assistant feature, read from Jetpack's
 * `wordpress-com/plans` store. `hasFeature` is `wpcom_site_has_feature(
 * 'ai-assistant' )` — granted by Jetpack AI plans, wpcom Personal and
 * higher, or Jetpack Complete — the same flag the video-generation server
 * gate checks. Returns false ONLY on confirmed data; store absent or data
 * not yet loaded fails open to true. Callers decide where the result
 * applies (e.g. site-type scoping).
 */
export function useHasAiAssistantFeature(): boolean {
	const { hasFeature, isRequesting, storeAvailable } = useSelect( ( select ) => {
		const store = select( PLANS_STORE ) as PlansStoreSelectors | undefined;
		return {
			hasFeature: store?.getAiAssistantFeature?.()?.hasFeature,
			isRequesting: store?.getIsRequestingAiAssistantFeature?.() ?? false,
			storeAvailable: !! store?.getAiAssistantFeature,
		};
	}, [] );

	useEffect( () => {
		if ( ! storeAvailable || fetchDispatched || isRequesting ) {
			return;
		}
		fetchDispatched = true;
		const plansDispatch = dispatch( PLANS_STORE ) as
			| { fetchAiAssistantFeature?: () => void }
			| undefined;
		plansDispatch?.fetchAiAssistantFeature?.();
	}, [ storeAvailable, isRequesting ] );

	return hasFeature !== false;
}
