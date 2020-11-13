/**
 * External dependencies
 */
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { localizeUrl } from './localize-url';

export function useI18nUtils() {
	const { i18nLocale } = useI18n();

	return {
		locale: i18nLocale,
		localizeUrl: ( fullUrl: string, locale?: Locale ) => {
			if ( locale ) {
				return localizeUrl( fullUrl, locale );
			}
			return localizeUrl( fullUrl, i18nLocale );
		},
	};
}
