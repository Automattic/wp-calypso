/**
 * External dependencies
 */
import { createReduxStore, register } from '@wordpress/data';
/**
 * Internal dependencies
 */
import actions from './actions';
import reducer from './reducer';
/**
 * Types
 */
import type { AiFeatureProps, PlanStateProps } from './types';

export const STORE_WPCOM_PLANS = 'wordpress-com/plans';

const wordpressPlansStore = createReduxStore( STORE_WPCOM_PLANS, {
	// @ts-expect-error -- TSCONVERSION
	__experimentalUseThunks: true,

	actions,

	reducer,

	selectors: {
		/**
		 * Return the AI Assistant feature.
		 * @param {PlanStateProps} state - The Plans state tree.
		 * @returns {AiFeatureProps}       The AI Assistant feature data.
		 */
		getAiAssistantFeature( state: PlanStateProps, siteId: string = '' ): Partial< AiFeatureProps > {
			// Clean up the _meta property.
			const data = { ...state.features.aiAssistant, siteId };
			delete data._meta;

			return data;
		},

		/**
		 * Get the isRequesting flag for the AI Assistant feature.
		 *
		 * @param {PlanStateProps} state - The Plans state tree.
		 * @returns {boolean}              The isRequesting flag.
		 */
		getIsRequestingAiAssistantFeature( state: PlanStateProps ): boolean {
			return state.features.aiAssistant?._meta?.isRequesting ?? false;
		},
	},

	resolvers: {
		getAiAssistantFeature: ( state: PlanStateProps, siteId: string ) => {
			// eslint-disable-next-line no-console
			console.log( 'RESOLVER getAiAssistantFeature', state, String( siteId ) );
			if ( state?.features?.aiAssistant ) {
				return;
			}

			return actions.fetchAiAssistantFeature( String( state ) );
		},
	},
} );

register( wordpressPlansStore );
