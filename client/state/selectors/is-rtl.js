/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getLanguage } from 'lib/i18n-utils';

/**
 * Returns whether the current uses right-to-left directionality.
 *
 * @param  {Object}   state      Global state tree
 * @return {?Boolean}            Current user is rtl
 */
export default function isRtl( state ) {
	const localeSlug = get( state, 'ui.language.localeSlug', 'en' );

	return Boolean( getLanguage( localeSlug ).rtl );
}
