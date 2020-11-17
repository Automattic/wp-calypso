/**
 * Internal dependencies
 */
import { localizeUrl } from './localize-url';
import { Locale } from './locales';
import { LocaleProvider, useLocale } from './locale-context';

export { LocaleProvider, useLocale };

export interface I18nUtils {
	localizeUrl: typeof localizeUrl;
}

export function useI18nUtils(): I18nUtils {
	const locale = useLocale();

	return {
		localizeUrl: ( fullUrl: string, toLocale?: Locale ) => {
			if ( toLocale ) {
				return localizeUrl( fullUrl, toLocale );
			}
			return localizeUrl( fullUrl, locale );
		},
	};
}
