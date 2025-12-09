import { useTranslate } from 'i18n-calypso';

/**
 * Returns the translate function and a flag indicating whether the current
 * i18n instance is already set to the requested locale.
 *
 * When the locale is not ready (e.g., bundle still loading), callers may
 * choose to defer expensive locale-dependent work until translations arrive.
 */
export function useLocaleReadyTranslate( targetLocale?: string ) {
	const translate = useTranslate();
	const isReady = ! targetLocale || translate.localeSlug === targetLocale;

	return { translate, isReady };
}

export default useLocaleReadyTranslate;
