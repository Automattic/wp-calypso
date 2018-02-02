/** @format */

/**
 * Internal dependencies
 */
import userSettings from 'lib/user-settings';
import { isMobile } from 'lib/viewport';


export function canDisplayCommunityTranslator( locale = userSettings.getSetting( 'language' ) ) {
	// restrict mobile devices from translator for now while we refine touch interactions
	if ( isMobile() ) {
		return false;
	}

	if ( 'en' === locale || ! locale ) {
		return false;
	}

	return true;
}

export function isCommunityTranslatorEnabled() {
	if ( ! userSettings.getSettings() || ! userSettings.getOriginalSetting( 'enable_translator' ) ) {
		return false;
	}

	// restrict mobile devices from translator for now while we refine touch interactions
	if ( ! canDisplayCommunityTranslator() ) {
		return false;
	}

	return true;
}
