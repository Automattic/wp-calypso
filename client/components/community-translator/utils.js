/** @format */

/**
 * Internal dependencies
 */
import User from 'lib/user';
import userSettings from 'lib/user-settings';
import { isMobile } from 'lib/viewport';

const user = new User();

export function canDisplayCommunityTranslator() {
	// restrict mobile devices from translator for now while we refine touch interactions
	if ( isMobile() ) {
		return false;
	}
	const currentUser = user.get();

	if ( ! currentUser || 'en' === currentUser.localeSlug || ! currentUser.localeSlug ) {
		return false;
	}
	return true;
}

export function isCommunityTranslatorEnabled() {
	// restrict mobile devices from translator for now while we refine touch interactions
	if ( ! canDisplayCommunityTranslator() ) {
		return false;
	}

	if ( ! userSettings.getSettings() || ! userSettings.getOriginalSetting( 'enable_translator' ) ) {
		return false;
	}

	return true;
}
