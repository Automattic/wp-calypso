/** @format */
/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	I18N_COMMUNITY_TRANSLATOR_TOGGLE_ACTIVATION,
} from 'state/action-types';
import userSettings from 'lib/user-settings';

/**
 * Action creator function: I18N_COMMUNITY_TRANSLATOR_TOGGLE_ACTIVATION
 *
 * @return {Object} action object
 */
export const toggleCommunityTranslator = () => {
	i18n.reRenderTranslations();
	return {
		type: I18N_COMMUNITY_TRANSLATOR_TOGGLE_ACTIVATION,
		activated: userSettings.getSettings() && userSettings.getOriginalSetting( 'enable_translator' ),
	};
};
