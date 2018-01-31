/** @format */

/**
 * Internal dependencies
 */
import {
	I18N_COMMUNITY_TRANSLATOR_ACTIVATE,
	I18N_COMMUNITY_TRANSLATOR_DEACTIVATE,
	I18N_COMMUNITY_TRANSLATOR_REFRESH,
} from 'state/action-types';

/**
 * Action creator function: I18N_COMMUNITY_TRANSLATOR_REFRESH
 *
 * @return {Object} action object
 */
export const refreshCommunityTranslator = () => ( {
	type: I18N_COMMUNITY_TRANSLATOR_REFRESH,
} );

/**
 * Action creator function: I18N_COMMUNITY_TRANSLATOR_ACTIVATE
 *
 * @return {Object} action object
 */
export const activateCommunityTranslator = () => ( {
	type: I18N_COMMUNITY_TRANSLATOR_ACTIVATE,
} );

/**
 * Action creator function: I18N_COMMUNITY_TRANSLATOR_DEACTIVATE
 *
 * @return {Object} action object
 */
export const deactivateCommunityTranslator = () => ( {
	type: I18N_COMMUNITY_TRANSLATOR_DEACTIVATE,
} );

