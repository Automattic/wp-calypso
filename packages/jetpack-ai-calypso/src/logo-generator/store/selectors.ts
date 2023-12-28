/**
 * Types
 */
import type { AiFeatureProps, LogoGeneratorStateProp, Logo } from './types';

const selectors = {
	/**
	 * Return the AI Assistant feature.
	 * @param {LogoGeneratorStateProp} state - The app state tree.
	 * @returns {Partial<AiFeatureProps>}      The AI Assistant feature data.
	 */
	getAiAssistantFeature( state: LogoGeneratorStateProp ): Partial< AiFeatureProps > {
		// Clean up the _meta property.
		const data = { ...state.features.aiAssistantFeature };
		delete data._meta;

		return data;
	},

	/**
	 * Get the isRequesting flag for the AI Assistant feature.
	 * @param {LogoGeneratorStateProp} state - The app state tree.
	 * @returns {boolean}                      The isRequesting flag.
	 */
	getIsRequestingAiAssistantFeature( state: LogoGeneratorStateProp ): boolean {
		return state.features.aiAssistantFeature?._meta?.isRequesting ?? false;
	},

	/**
	 * Get the logos history.
	 * @param {LogoGeneratorStateProp} state - The app state tree.
	 * @returns {Array<Logo>}                  The logos history array.
	 */
	getLogos( state: LogoGeneratorStateProp ): Array< Logo > {
		return state.history?.logos ?? [];
	},

	/**
	 * Get the selected logo.
	 * @param {LogoGeneratorStateProp} state - The app state tree.
	 * @returns {Logo}                         The selected logo.
	 */
	getSelectedLogo( state: LogoGeneratorStateProp ): Logo {
		return state.history?.logos?.[ state.history.selectedLogoIndex ] ?? null;
	},
};

export default selectors;
