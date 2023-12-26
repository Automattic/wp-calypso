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
import type { AiFeatureProps, LogoGeneratorStateProp } from './types';

export const STORE_NAME = 'jetpack-ai/logo-generator';

const jetpackAiLogoGeneratorStore = createReduxStore( STORE_NAME, {
	// @ts-expect-error -- TSCONVERSION
	__experimentalUseThunks: true,

	actions,

	reducer,

	selectors: {
		/**
		 * Return the AI Assistant feature.
		 * @param {LogoGeneratorStateProp} state - The app state tree.
		 * @returns {AiFeatureProps}       The AI Assistant feature data.
		 */
		getAiAssistantFeature( state: LogoGeneratorStateProp ): Partial< AiFeatureProps > {
			// Clean up the _meta property.
			const data = { ...state.features.aiAssistantFeature };
			delete data._meta;

			return data;
		},

		/**
		 * Get the isRequesting flag for the AI Assistant feature.
		 *
		 * @param {LogoGeneratorStateProp} state - The app state tree.
		 * @returns {boolean}              The isRequesting flag.
		 */
		getIsRequestingAiAssistantFeature( state: LogoGeneratorStateProp ): boolean {
			return state.features.aiAssistantFeature?._meta?.isRequesting ?? false;
		},
	},

	resolvers: {
		getAiAssistantFeature: ( siteId: string ) =>
			actions.fetchAiAssistantFeature( String( siteId ) ),
	},
} );

register( jetpackAiLogoGeneratorStore );
