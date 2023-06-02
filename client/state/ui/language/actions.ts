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
	setCurrencyLocale( localeVariant || localeSlug );
	switchLocale( localeVariant || localeSlug );
	return {
		type: LOCALE_SET,
		localeSlug,
		localeVariant,
	};
};
