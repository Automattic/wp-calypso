/**
 * External dependencies
 */
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { localizeUrl } from './localize-url';
import { Locale } from './locales';

export interface I18nUtils {
	localizeUrl: typeof localizeUrl;
}

export function useI18nUtils(): I18nUtils {
	const { i18nLocale } = useI18n();

	return {
		localizeUrl: ( fullUrl: string, locale?: Locale ) => {
			if ( locale ) {
				return localizeUrl( fullUrl, locale );
			}
			return localizeUrl( fullUrl, i18nLocale );
		},
	};
}
