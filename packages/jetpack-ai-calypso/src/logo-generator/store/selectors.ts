/**
 * Types
 */
import type { AiFeatureProps, LogoGeneratorStateProp, Logo } from './types';
import type { SiteDetails } from '@automattic/data-stores';

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
	 * Return the site details.
	 * @param {LogoGeneratorStateProp} state       - The app state tree.
	 * @returns {Partial<SiteDetails> | undefined}   The site details.
	 */
	getSiteDetails( state: LogoGeneratorStateProp ): Partial< SiteDetails > | undefined {
		return state.siteDetails;
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
		return state.history ?? [];
	},

	/**
	 * Get the selected logo.
	 * @param {LogoGeneratorStateProp} state - The app state tree.
	 * @returns {Logo}                         The selected logo.
	 */
	getSelectedLogo( state: LogoGeneratorStateProp ): Logo {
		return state.history?.[ state.selectedLogoIndex ] ?? null;
	},

	/**
	 * Get the isSavingToLibrary flag.
	 * @param {LogoGeneratorStateProp} state - The app state tree.
	 * @returns {boolean}                      The isSavingToLibrary flag.
	 */
	getSavingLogoToLibrary( state: LogoGeneratorStateProp ): boolean {
		return state._meta?.isSavingLogoToLibrary ?? false;
	},

	/**
	 * Get the isApplyingLogo flag.
	 * @param {LogoGeneratorStateProp} state - The app state tree.
	 * @returns {boolean}                      The isApplyingLogo flag.
	 */
	getApplyingLogo( state: LogoGeneratorStateProp ): boolean {
		return state._meta?.isApplyingLogo ?? false;
	},

	/**
	 * Get the isRequestingImage flag.
	 * @param {LogoGeneratorStateProp} state - The app state tree.
	 * @returns {boolean}                      The isRequestingImage flag.
	 */
	getIsRequestingImage( state: LogoGeneratorStateProp ): boolean {
		return state._meta?.isRequestingImage ?? false;
	},
};

export default selectors;
