import { canBeTranslated } from '@automattic/i18n-utils';
import { isMobile } from '@automattic/viewport';
import getUserSetting from 'calypso/state/selectors/get-user-setting';

/**
 * Checks whether the CT can be displayed, that is, if the chosen locale and device allow it
 *
 * @param {Object} state Global state tree
 * @returns {boolean} whether the CT can be displayed
 */
export default function canDisplayCommunityTranslator( state ) {
	const language = getUserSetting( state, 'language' );
	const localeVariant = getUserSetting( state, 'locale_variant' );

	// restrict mobile devices from translator for now while we refine touch interactions
	if ( isMobile() ) {
		return false;
	}

	// disable for locales with no official GP translation sets.
	if ( ! language || ! canBeTranslated( language ) ) {
		return false;
	}

	// likewise, disable for locale variants with no official GP translation sets
	if ( localeVariant && ! canBeTranslated( localeVariant ) ) {
		return false;
	}

	return true;
}
