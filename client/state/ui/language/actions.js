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
 * @param   {String?} localeVariant the slug of the variant of localeSlug
 * @returns {Object} Action
 */
export const setLocale = ( localeSlug, localeVariant = null ) => {
	switchLocale( localeSlug, localeVariant );
	// eslint-disable-next-line
	console.log( 'setLocale', localeSlug );
	return {
		type: LOCALE_SET,
		localeSlug,
		localeVariant,
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

	const { localeSlug, localeVariant = null } = localeData[ '' ];

	return {
		type: LOCALE_SET,
		localeSlug,
		localeVariant,
	};
};
