import { setDefaultLocale as setCurrencyLocale } from '@automattic/format-currency';
import switchLocale from 'calypso/lib/i18n-utils/switch-locale';
import { LOCALE_SET } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Set the ui locale
 */
export const setLocale = (
	localeSlug: string,
	localeVariant: string | null | undefined = null
) => {
	const newLocale = localeVariant || localeSlug;

	// Side effect: change the current currency formatting locale.
	// If the default ("English") is selected, instead allow the currency
	// library to use its default, which is the browser's locale.
	setCurrencyLocale( newLocale === 'en' ? undefined : newLocale );

	// Side effect: change the current translation locale.
	switchLocale( newLocale );

	return {
		type: LOCALE_SET,
		localeSlug,
		localeVariant,
	};
};
