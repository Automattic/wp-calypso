/**
 * Internal dependencies
 */
import { getSiteLogoHistory } from '../lib/logo-storage';
import wpcomLimitedRequest from '../lib/wpcom-limited-request';
/**
 * Types & Constants
 */
import {
	ACTION_INCREASE_AI_ASSISTANT_REQUESTS_COUNT,
	ACTION_REQUEST_AI_ASSISTANT_FEATURE,
	ACTION_SET_AI_ASSISTANT_FEATURE_REQUIRE_UPGRADE,
	ACTION_SET_SITE_DETAILS,
	ACTION_STORE_AI_ASSISTANT_FEATURE,
	ACTION_SET_TIER_PLANS_ENABLED,
	ACTION_SET_SELECTED_LOGO_INDEX,
	ACTION_ADD_LOGO_TO_HISTORY,
	ACTION_SET_IS_SAVING_LOGO_TO_LIBRARY,
	ACTION_SAVE_SELECTED_LOGO,
	ACTION_SET_IS_REQUESTING_IMAGE,
	ACTION_SET_IS_APPLYING_LOGO,
	ACTION_SET_IS_ENHANCING_PROMPT,
	ACTION_SET_SITE_HISTORY,
	ACTION_SET_FEATURE_FETCH_ERROR,
	ACTION_SET_FIRST_LOGO_PROMPT_FETCH_ERROR,
	ACTION_SET_ENHANCE_PROMPT_FETCH_ERROR,
	ACTION_SET_LOGO_FETCH_ERROR,
	ACTION_SET_LOGO_UPDATE_ERROR,
	ACTION_SET_SAVE_TO_LIBRARY_ERROR,
	ACTION_SET_CONTEXT,
} from './constants';
import type {
	AiFeatureProps,
	AiAssistantFeatureEndpointResponseProps,
	Logo,
	RequestError,
} from './types';
import type { SiteDetails } from '@automattic/data-stores';

/**
 * Map the response from the `sites/$site/ai-assistant-feature`
 * endpoint to the AI Assistant feature props.
 * @param { AiAssistantFeatureEndpointResponseProps } response - The response from the endpoint.
 * @returns { AiFeatureProps }                                       The AI Assistant feature props.
 */
export function mapAiFeatureResponseToAiFeatureProps(
	response: AiAssistantFeatureEndpointResponseProps
): AiFeatureProps {
	return {
		hasFeature: !! response[ 'has-feature' ],
		isOverLimit: !! response[ 'is-over-limit' ],
		requestsCount: response[ 'requests-count' ],
		requestsLimit: response[ 'requests-limit' ],
		requireUpgrade: !! response[ 'site-require-upgrade' ],
		errorMessage: response[ 'error-message' ],
		errorCode: response[ 'error-code' ],
		upgradeType: response[ 'upgrade-type' ],
		usagePeriod: {
			currentStart: response[ 'usage-period' ]?.[ 'current-start' ],
			nextStart: response[ 'usage-period' ]?.[ 'next-start' ],
			requestsCount: response[ 'usage-period' ]?.[ 'requests-count' ] || 0,
		},
		currentTier: response[ 'current-tier' ],
		nextTier: response[ 'next-tier' ],
		tierPlansEnabled: !! response[ 'tier-plans-enabled' ],
		costs: response.costs,
		featuresControl: response[ 'features-control' ],
	};
}

const actions = {
	storeAiAssistantFeature( feature: AiFeatureProps ) {
		return {
			type: ACTION_STORE_AI_ASSISTANT_FEATURE,
			feature,
		};
	},

	/**
	 * Thunk action to fetch the AI Assistant feature from the API.
	 * @returns {Function} The thunk action.
	 */
	fetchAiAssistantFeature( siteId: string ) {
		return async ( { dispatch }: { dispatch: any } ) => {
			// Dispatch isFetching action.
			dispatch( { type: ACTION_REQUEST_AI_ASSISTANT_FEATURE } );

			try {
				const response: AiAssistantFeatureEndpointResponseProps = await wpcomLimitedRequest( {
					apiNamespace: 'wpcom/v2',
					path:
						'/sites/' + encodeURIComponent( String( siteId ) ) + '/jetpack-ai/ai-assistant-feature',
					query: 'force=wpcom',
				} );

				// Store the feature in the store.
				dispatch(
					actions.storeAiAssistantFeature( mapAiFeatureResponseToAiFeatureProps( response ) )
				);
			} catch ( err ) {
				// Mark the fetch as failed.
				dispatch( { type: ACTION_SET_FEATURE_FETCH_ERROR, error: err } );
			}
		};
	},

	/**
	 * This thunk action is used to increase
	 * the requests count for the current usage period.
	 * @param {number} count - The number of requests to increase. Default is 1.
	 * @returns {Function}     The thunk action.
	 */
	increaseAiAssistantRequestsCount( count: number = 1 ) {
		return ( { dispatch }: { dispatch: any } ) => {
			dispatch( {
				type: ACTION_INCREASE_AI_ASSISTANT_REQUESTS_COUNT,
				count,
			} );
		};
	},

	setAiAssistantFeatureRequireUpgrade( requireUpgrade: boolean = true ) {
		return {
			type: ACTION_SET_AI_ASSISTANT_FEATURE_REQUIRE_UPGRADE,
			requireUpgrade,
		};
	},

	setTierPlansEnabled( tierPlansEnabled: boolean = true ) {
		return {
			type: ACTION_SET_TIER_PLANS_ENABLED,
			tierPlansEnabled,
		};
	},

	setSiteDetails( siteDetails: SiteDetails ) {
		return {
			type: ACTION_SET_SITE_DETAILS,
			siteDetails,
		};
	},

	setSelectedLogoIndex( selectedLogoIndex: number ) {
		return {
			type: ACTION_SET_SELECTED_LOGO_INDEX,
			selectedLogoIndex,
		};
	},

	addLogoToHistory( logo: Logo ) {
		return {
			type: ACTION_ADD_LOGO_TO_HISTORY,
			logo,
		};
	},

	setIsSavingLogoToLibrary( isSavingLogoToLibrary: boolean ) {
		return {
			type: ACTION_SET_IS_SAVING_LOGO_TO_LIBRARY,
			isSavingLogoToLibrary,
		};
	},

	setIsApplyingLogo( isApplyingLogo: boolean ) {
		return {
			type: ACTION_SET_IS_APPLYING_LOGO,
			isApplyingLogo,
		};
	},

	updateSelectedLogo( mediaId: string, url: string ) {
		return {
			type: ACTION_SAVE_SELECTED_LOGO,
			mediaId,
			url,
		};
	},

	setIsRequestingImage( isRequestingImage: boolean ) {
		return {
			type: ACTION_SET_IS_REQUESTING_IMAGE,
			isRequestingImage,
		};
	},

	setIsEnhancingPrompt( isEnhancingPrompt: boolean ) {
		return {
			type: ACTION_SET_IS_ENHANCING_PROMPT,
			isEnhancingPrompt,
		};
	},

	loadLogoHistory( siteId: string ) {
		const history = getSiteLogoHistory( siteId );

		return {
			type: ACTION_SET_SITE_HISTORY,
			history,
		};
	},

	setFeatureFetchError( error: RequestError ) {
		return {
			type: ACTION_SET_FEATURE_FETCH_ERROR,
			error,
		};
	},

	setFirstLogoPromptFetchError( error: RequestError ) {
		return {
			type: ACTION_SET_FIRST_LOGO_PROMPT_FETCH_ERROR,
			error,
		};
	},

	setEnhancePromptFetchError( error: RequestError ) {
		return {
			type: ACTION_SET_ENHANCE_PROMPT_FETCH_ERROR,
			error,
		};
	},

	setLogoFetchError( error: RequestError ) {
		return {
			type: ACTION_SET_LOGO_FETCH_ERROR,
			error,
		};
	},

	setSaveToLibraryError( error: RequestError ) {
		return {
			type: ACTION_SET_SAVE_TO_LIBRARY_ERROR,
			error,
		};
	},

	setLogoUpdateError( error: RequestError ) {
		return {
			type: ACTION_SET_LOGO_UPDATE_ERROR,
			error,
		};
	},

	setContext( context: string ) {
		return {
			type: ACTION_SET_CONTEXT,
			context,
		};
	},
};

export default actions;
