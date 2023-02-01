import { ENABLE_TRANSLATOR_KEY } from 'calypso/lib/i18n-utils/constants';
import canDisplayCommunityTranslator from 'calypso/state/selectors/can-display-community-translator';
import getUserSetting from 'calypso/state/selectors/get-user-setting';

/**
 * Checks whether the CT is enabled, that is, if
 * 1) the user has chosen to enable it,
 * 2) it can be displayed based on the user's language and device settings
 *
 * @param {Object} state Global state tree
 * @returns {boolean} whether the CT should be enabled
 */
export default function isCommunityTranslatorEnabled( state ) {
	const enableTranslator = getUserSetting( state, ENABLE_TRANSLATOR_KEY );

	if ( ! enableTranslator ) {
		return false;
	}

	if ( ! canDisplayCommunityTranslator( state ) ) {
		return false;
	}

	return true;
}
