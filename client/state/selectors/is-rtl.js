/** @format */

/**
 * Internal dependencies
 */

import { getLanguage } from 'client/lib/i18n-utils';
import getCurrentLocaleSlug from 'client/state/selectors/get-current-locale-slug';

/**
 * Returns whether the current uses right-to-left directionality.
 *
 * @param  {Object}   state      Global state tree
 * @return {?Boolean}            Current user is rtl
 */
export default function isRtl( state ) {
	const localeSlug = getCurrentLocaleSlug( state );

	if ( ! localeSlug ) {
		return null;
	}

	const language = getLanguage( localeSlug );

	if ( ! language ) {
		return null;
	}

	return Boolean( language.rtl );
}
