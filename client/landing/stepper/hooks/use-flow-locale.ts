import { useLocale } from '@automattic/i18n-utils';
import { getLocaleFromQueryParam, getLocaleFromPathname } from 'calypso/boot/locale';

export function useFlowLocale() {
	// There is a race condition where useLocale is reporting english,
	// despite there being a locale in the URL so we need to look it up manually.
	// We also need to support both query param and path suffix localized urls
	// depending on where the user is coming from.
	const localeSlug = useLocale();
	// Query param support can be removed after dotcom-forge/issues/2960 and 2961 are closed.
	const queryLocaleSlug = getLocaleFromQueryParam();
	const pathLocaleSlug = getLocaleFromPathname();
	const flowLocale = queryLocaleSlug || pathLocaleSlug || localeSlug;

	return flowLocale;
}
