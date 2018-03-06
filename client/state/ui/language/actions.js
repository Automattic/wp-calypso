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
 * Set the ui locale and ui locale variant
 *
 * @param   {String} localeSlug the locale slug to change the ui locale to
 * @param   {String} localeVariant optional local variant to switch to
 * @returns {Function} Action thunk
 */
export const setLocale = ( localeSlug, localeVariant ) => {
	switchLocale( localeSlug, localeVariant );
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
	return {
		type: LOCALE_SET,
		localeSlug: localeData[ '' ].localeSlug,
	};
};
