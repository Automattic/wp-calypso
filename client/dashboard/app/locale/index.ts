import { getIntlLocale } from '../../utils/locale';
import { useAuth } from '../auth';
import { getUserLanguage } from '../shared-locale-loader';
import { useSessionLocale } from './session-locale';

type ComputedAttributes = {
	localeSlug?: string;
	localeVariant?: string;
};

// Determine the locale to use. A session locale (set by the omnibar language
// switcher) takes precedence over the logged-in user's saved locale.
export function useLocaleSlug() {
	const { user } = useAuth();
	const sessionLocale = useSessionLocale();
	return sessionLocale ?? getUserLanguage( user );
}

export function useLocale() {
	const { user } = useAuth();
	const sessionLocale = useSessionLocale();
	if ( sessionLocale ) {
		return sessionLocale;
	}

	const u = user as typeof user & ComputedAttributes;
	return u.localeVariant || u.localeSlug || user.locale_variant || user.language || 'en';
}

// The locale as a BCP 47 language tag, safe to pass to `Intl` constructors.
export function useIntlLocale() {
	return getIntlLocale( useLocale() );
}

// A collator for sorting user-visible strings.
export function useIntlCollator() {
	return new Intl.Collator( [ useIntlLocale(), 'en' ] );
}
