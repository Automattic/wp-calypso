/** @format */

/**
 * External dependencies
 */

import switchLocale from 'lib/i18n-utils/switch-locale';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { LOCALE_SET } from 'state/action-types';

/**
 * Set the ui locale
 *
 * @param   {String} localeSlug the locale slug to change the locale to
 * @returns {Object} Action
 */
export const setLocale = localeSlug => {
	switchLocale( localeSlug );
	return {
		type: LOCALE_SET,
		localeSlug,
	};
};

/**
 * Set the ui locale using a raw (jed) translation object
 *
 * @param   {Object} localeData the locale data to be set
 * @returns {Object} Action
 */
export const setLocaleRawData = localeData => {
	i18n.setLocale( localeData );

	// This is a bit of an ugly hack to make `localeVariant` fall back to `localeSlug`.
	const { localeSlug, localeVariant = localeSlug } = localeData[ '' ];

	return {
		type: LOCALE_SET,
		localeSlug: localeVariant,
	};
};
