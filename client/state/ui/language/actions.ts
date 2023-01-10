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
	/**
	 * Also change the translation and currency locale.
	 *
	 * This is not a great place to put a side effect because it's an action
	 * creator, and should simply return an object, but it's been here for a long
	 * time since https://github.com/Automattic/wp-calypso/pull/18297
	 */
	setCurrencyLocale( localeVariant || localeSlug );
	switchLocale( localeVariant || localeSlug );
	return {
		type: LOCALE_SET,
		localeSlug,
		localeVariant,
	};
};
