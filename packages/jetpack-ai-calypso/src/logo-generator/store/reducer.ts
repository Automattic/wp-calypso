/**
 * Types & Constants
 */
import { DEFAULT_LOGO_COST } from '../../constants';
import {
	ACTION_INCREASE_AI_ASSISTANT_REQUESTS_COUNT,
	ACTION_REQUEST_AI_ASSISTANT_FEATURE,
	ACTION_SET_AI_ASSISTANT_FEATURE_REQUIRE_UPGRADE,
	ACTION_STORE_AI_ASSISTANT_FEATURE,
	ASYNC_REQUEST_COUNTDOWN_INIT_VALUE,
	FREE_PLAN_REQUESTS_LIMIT,
	UNLIMITED_PLAN_REQUESTS_LIMIT,
	ACTION_SET_TIER_PLANS_ENABLED,
	ACTION_SET_SITE_DETAILS,
	ACTION_SET_SELECTED_LOGO_INDEX,
	ACTION_ADD_LOGO_TO_HISTORY,
	ACTION_SAVE_SELECTED_LOGO,
	ACTION_SET_IS_SAVING_LOGO_TO_LIBRARY,
	ACTION_SET_IS_REQUESTING_IMAGE,
	ACTION_SET_IS_APPLYING_LOGO,
	ACTION_SET_IS_ENHANCING_PROMPT,
	ACTION_SET_SITE_HISTORY,
	ACTION_SET_FEATURE_FETCH_ERROR,
	ACTION_SET_FIRST_LOGO_PROMPT_FETCH_ERROR,
	ACTION_SET_ENHANCE_PROMPT_FETCH_ERROR,
	ACTION_SET_LOGO_FETCH_ERROR,
	ACTION_SET_SAVE_TO_LIBRARY_ERROR,
	ACTION_SET_LOGO_UPDATE_ERROR,
	ACTION_SET_CONTEXT,
} from './constants';
import INITIAL_STATE from './initial-state';
import type { AiFeatureStateProps, RequestError, TierLimitProp } from './types';
import type { SiteDetails } from '@automattic/data-stores';

export default function reducer(
	state = INITIAL_STATE,
	action: {
		type: string;
		feature?: AiFeatureStateProps;
		count?: number;
		requireUpgrade?: boolean;
		tierPlansEnabled?: boolean;
		siteDetails?: SiteDetails;
		selectedLogoIndex?: number;
		isSavingLogoToLibrary?: boolean;
		isApplyingLogo?: boolean;
		logo?: { url: string; description: string };
		mediaId?: number;
		url?: string;
		isRequestingImage?: boolean;
		isEnhancingPrompt?: boolean;
		history?: Array< { url: string; description: string; mediaId?: number } >;
		error?: RequestError;
		context?: string;
	}
) {
	switch ( action.type ) {
		case ACTION_REQUEST_AI_ASSISTANT_FEATURE:
			return {
				...state,
				_meta: {
					...( state._meta ?? {} ),
					// Reset the error state when requesting the feature.
					featureFetchError: null,
				},
				features: {
					...state.features,
					aiAssistantFeature: {
						...state.features.aiAssistantFeature,
						_meta: {
							...state?.features?.aiAssistantFeature?._meta,
							isRequesting: true,
							asyncRequestCountdown: ASYNC_REQUEST_COUNTDOWN_INIT_VALUE, // restore the countdown
							asyncRequestTimerId: 0, // reset the timer id
						},
					},
				},
			};

		case ACTION_STORE_AI_ASSISTANT_FEATURE: {
			const defaultCosts = {
				'jetpack-ai-logo-generator': {
					logo: DEFAULT_LOGO_COST,
				},
			};

			return {
				...state,
				features: {
					...state.features,
					aiAssistantFeature: {
						costs: defaultCosts,
						...action.feature,
						// re evaluate requireUpgrade as the logo generator does not allow free usage
						requireUpgrade:
							action.feature?.requireUpgrade || action.feature?.currentTier?.value === 0,
						_meta: {
							...state?.features?.aiAssistantFeature?._meta,
							isRequesting: false,
						},
					},
				},
			};
		}

		case ACTION_INCREASE_AI_ASSISTANT_REQUESTS_COUNT: {
			// Usage Period data
			const usagePeriod = state?.features?.aiAssistantFeature?.usagePeriod || { requestsCount: 0 };

			// Increase requests counters
			const requestsCount =
				( state?.features?.aiAssistantFeature?.requestsCount || 0 ) + ( action.count ?? 1 );
			usagePeriod.requestsCount += action.count ?? 1;

			// Current tier value
			const currentTierValue = state?.features?.aiAssistantFeature?.currentTier?.value;

			const isFreeTierPlan =
				( typeof currentTierValue === 'undefined' &&
					! state?.features?.aiAssistantFeature?.hasFeature ) ||
				currentTierValue === 0;

			const isUnlimitedTierPlan =
				( typeof currentTierValue === 'undefined' &&
					state?.features?.aiAssistantFeature?.hasFeature ) ||
				currentTierValue === 1;

			// Request limit defined with the current tier limit by default.
			let requestsLimit: TierLimitProp =
				state?.features?.aiAssistantFeature?.currentTier?.limit || FREE_PLAN_REQUESTS_LIMIT;

			if ( isUnlimitedTierPlan ) {
				requestsLimit = UNLIMITED_PLAN_REQUESTS_LIMIT;
			} else if ( isFreeTierPlan ) {
				requestsLimit = state?.features?.aiAssistantFeature?.requestsLimit as TierLimitProp;
			}

			const currentCount =
				isUnlimitedTierPlan || isFreeTierPlan // @todo: update once tier data is available
					? requestsCount
					: state?.features?.aiAssistantFeature?.usagePeriod?.requestsCount || 0;

			/**
			 * Compute the AI Assistant Feature data optimistically,
			 * based on the Jetpack_AI_Helper::get_ai_assistance_feature() helper.
			 * @see _inc/lib/class-jetpack-ai-helper.php
			 */
			const isOverLimit = currentCount >= requestsLimit;

			// highest tier holds a soft limit so requireUpgrade is false on that case (nextTier null means highest tier)
			const requireUpgrade =
				isFreeTierPlan || ( isOverLimit && state?.features?.aiAssistantFeature?.nextTier !== null );

			return {
				...state,
				features: {
					...state.features,
					aiAssistantFeature: {
						...state.features.aiAssistantFeature,
						isOverLimit,
						requestsCount,
						requireUpgrade,
						usagePeriod: { ...usagePeriod },
					},
				},
			};
		}

		case ACTION_SET_AI_ASSISTANT_FEATURE_REQUIRE_UPGRADE: {
			/*
			 * If we require an upgrade, we are also over the limit;
			 * The opposite is not true, we can be over the limit without
			 * requiring an upgrade, for example when we are on the highest tier.
			 * In this case, we don't want to set isOverLimit to false.
			 */
			return {
				...state,
				features: {
					...state.features,
					aiAssistantFeature: {
						...state.features.aiAssistantFeature,
						requireUpgrade: action.requireUpgrade,
						...( action.requireUpgrade ? { isOverLimit: true } : {} ),
					},
				},
			};
		}

		case ACTION_SET_TIER_PLANS_ENABLED: {
			return {
				...state,
				features: {
					...state.features,
					aiAssistantFeature: {
						...state.features.aiAssistantFeature,
						tierPlansEnabled: action.tierPlansEnabled,
					},
				},
			};
		}

		case ACTION_SET_SITE_DETAILS: {
			return {
				...state,
				siteDetails: action.siteDetails,
			};
		}

		case ACTION_SET_SELECTED_LOGO_INDEX: {
			return {
				...state,
				selectedLogoIndex: action.selectedLogoIndex,
			};
		}

		case ACTION_ADD_LOGO_TO_HISTORY: {
			const history = [ ...state.history, action.logo ];

			return {
				...state,
				history,
				selectedLogoIndex: history.length - 1,
			};
		}

		case ACTION_SET_IS_SAVING_LOGO_TO_LIBRARY: {
			return {
				...state,
				_meta: {
					...( state._meta ?? {} ),
					isSavingLogoToLibrary: action.isSavingLogoToLibrary,
				},
			};
		}

		case ACTION_SET_IS_APPLYING_LOGO: {
			return {
				...state,
				_meta: {
					...( state._meta ?? {} ),
					isApplyingLogo: action.isApplyingLogo,
				},
			};
		}

		case ACTION_SAVE_SELECTED_LOGO: {
			const selectedLogo = state.history?.[ state.selectedLogoIndex ];

			return {
				...state,
				history: [
					...state.history.slice( 0, state.selectedLogoIndex ),
					{
						...selectedLogo,
						mediaId: action.mediaId,
						url: action.url,
					},
					...state.history.slice( state.selectedLogoIndex + 1 ),
				],
			};
		}

		case ACTION_SET_IS_REQUESTING_IMAGE: {
			return {
				...state,
				_meta: {
					...( state._meta ?? {} ),
					isRequestingImage: action.isRequestingImage,
				},
			};
		}

		case ACTION_SET_IS_ENHANCING_PROMPT: {
			return {
				...state,
				_meta: {
					...( state._meta ?? {} ),
					isEnhancingPrompt: action.isEnhancingPrompt,
				},
			};
		}

		case ACTION_SET_SITE_HISTORY: {
			return {
				...state,
				history: action.history,
				selectedLogoIndex: action.history?.length ? action.history.length - 1 : 0,
			};
		}

		case ACTION_SET_FEATURE_FETCH_ERROR:
			return {
				...state,
				_meta: {
					...( state._meta ?? {} ),
					featureFetchError: action.error,
				},
			};

		case ACTION_SET_FIRST_LOGO_PROMPT_FETCH_ERROR:
			return {
				...state,
				_meta: {
					...( state._meta ?? {} ),
					firstLogoPromptFetchError: action.error,
				},
			};

		case ACTION_SET_ENHANCE_PROMPT_FETCH_ERROR:
			return {
				...state,
				_meta: {
					...( state._meta ?? {} ),
					enhancePromptFetchError: action.error,
				},
			};

		case ACTION_SET_LOGO_FETCH_ERROR:
			return {
				...state,
				_meta: {
					...( state._meta ?? {} ),
					logoFetchError: action.error,
				},
			};

		case ACTION_SET_SAVE_TO_LIBRARY_ERROR:
			return {
				...state,
				_meta: {
					...( state._meta ?? {} ),
					saveToLibraryError: action.error,
				},
			};

		case ACTION_SET_LOGO_UPDATE_ERROR:
			return {
				...state,
				_meta: {
					...( state._meta ?? {} ),
					logoUpdateError: action.error,
				},
			};

		case ACTION_SET_CONTEXT:
			return {
				...state,
				_meta: {
					...( state._meta ?? {} ),
					context: action.context,
				},
			};
	}

	return state;
}
