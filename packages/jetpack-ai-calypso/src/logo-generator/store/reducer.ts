/**
 * Types & Constants
 */
import {
	ACTION_DECREASE_NEW_ASYNC_REQUEST_COUNTDOWN,
	ACTION_ENQUEUE_ASYNC_REQUEST,
	ACTION_INCREASE_AI_ASSISTANT_REQUESTS_COUNT,
	ACTION_REQUEST_AI_ASSISTANT_FEATURE,
	ACTION_SET_AI_ASSISTANT_FEATURE_REQUIRE_UPGRADE,
	ACTION_STORE_AI_ASSISTANT_FEATURE,
	ASYNC_REQUEST_COUNTDOWN_INIT_VALUE,
	FREE_PLAN_REQUESTS_LIMIT,
	UNLIMITED_PLAN_REQUESTS_LIMIT,
	ACTION_SET_TIER_PLANS_ENABLED,
	ACTION_SET_SITE_DETAILS,
} from './constants';
import type { LogoGeneratorStateProp, TierLimitProp } from './types';

const INITIAL_STATE: LogoGeneratorStateProp = {
	siteDetails: {},
	suggestions: [],
	features: {
		aiAssistantFeature: {
			hasFeature: true,
			isOverLimit: false,
			requestsCount: 0,
			requestsLimit: FREE_PLAN_REQUESTS_LIMIT,
			requireUpgrade: false,
			errorMessage: '',
			errorCode: '',
			upgradeType: 'default',
			currentTier: {
				slug: 'ai-assistant-tier-free',
				value: 0,
				limit: 20,
			},
			usagePeriod: {
				currentStart: '',
				nextStart: '',
				requestsCount: 0,
			},
			nextTier: null,
			tierPlansEnabled: false,
			_meta: {
				isRequesting: false,
				asyncRequestCountdown: ASYNC_REQUEST_COUNTDOWN_INIT_VALUE,
				asyncRequestTimerId: 0,
			},
		},
	},
};

export default function reducer( state = INITIAL_STATE, action: any ) {
	switch ( action.type ) {
		case ACTION_REQUEST_AI_ASSISTANT_FEATURE:
			return {
				...state,
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
			return {
				...state,
				features: {
					...state.features,
					aiAssistantFeature: {
						...action.feature,
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
			const requestsCount = state?.features?.aiAssistantFeature?.requestsCount + action.count;
			usagePeriod.requestsCount += action.count;

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
					: state?.features?.aiAssistantFeature?.usagePeriod?.requestsCount;

			/**
			 * Compute the AI Assistant Feature data optimistically,
			 * based on the Jetpack_AI_Helper::get_ai_assistance_feature() helper.
			 * @see _inc/lib/class-jetpack-ai-helper.php
			 */
			const isOverLimit = currentCount >= requestsLimit;

			// highest tier holds a soft limit so requireUpgrade is false on that case (nextTier null means highest tier)
			const requireUpgrade = isOverLimit && state?.features?.aiAssistantFeature?.nextTier !== null;

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

		case ACTION_DECREASE_NEW_ASYNC_REQUEST_COUNTDOWN: {
			return {
				...state,
				features: {
					...state.features,
					aiAssistantFeature: {
						...state.features.aiAssistantFeature,
						_meta: {
							...state?.features?.aiAssistantFeature?._meta,
							asyncRequestCountdown:
								( state?.features?.aiAssistantFeature?._meta?.asyncRequestCountdown || 0 ) - 1,
						},
					},
				},
			};
		}

		case ACTION_ENQUEUE_ASYNC_REQUEST: {
			return {
				...state,
				features: {
					...state.features,
					aiAssistantFeature: {
						...state.features.aiAssistantFeature,
						_meta: {
							...state?.features?.aiAssistantFeature?._meta,
							asyncRequestTimerId: action.timerId,
						},
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
	}

	return state;
}
