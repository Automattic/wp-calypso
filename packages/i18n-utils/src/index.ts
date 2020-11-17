/**
 * Internal dependencies
 */
import { localizeUrl } from './localize-url';
import { Locale } from './locales';
import { LocaleProvider, useLocale } from './locale-context';

export { LocaleProvider, useLocale, localizeUrl };

export interface I18nUtils {
	localizeUrl: typeof localizeUrl;
}

export function useI18nUtils(): I18nUtils {
	const providerLocale = useLocale();

	return {
		localizeUrl: ( fullUrl: string, locale?: Locale ) => {
			if ( locale ) {
				return localizeUrl( fullUrl, locale );
			}
			return localizeUrl( fullUrl, providerLocale );
		},
	};
}
