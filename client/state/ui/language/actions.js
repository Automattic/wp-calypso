import switchLocale from 'calypso/lib/i18n-utils/switch-locale';
import { LOCALE_SET } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Set the ui locale
 *
 * @param   {string} localeSlug the locale slug to change the locale to
 * @param   {string?} localeVariant the slug of the variant of localeSlug
 * @returns {object} Action
 */
export const setLocale = ( localeSlug, localeVariant = null ) => {
	switchLocale( localeVariant || localeSlug );
	return {
		type: LOCALE_SET,
		localeSlug,
		localeVariant,
	};
};
