import { isTranslatedIncompletely } from '@automattic/i18n-utils';
import { getIntlLocale } from '../../utils/locale';
import { useAuth } from '../auth';
import { useSessionLocale } from './session-locale';
import type { User } from '@automattic/api-core';

type ComputedAttributes = {
	localeSlug?: string;
	localeVariant?: string;
};

/**
 * Derives the effective locale slug for a user:
 *
 *   - Falls back to English when the user has
 *     `use_fallback_for_incomplete_languages` enabled and their language
 *     is not fully translated (checked against `localeVariant || localeSlug`,
 *     matching `setUpLoggedInRoute`).
 *   - Prefers `localeVariant` (e.g. `es-mx`) so users get region-specific
 *     translations, falling back to `localeSlug`, then to the REST
 *     `locale_variant` / `language` fields for non-bootstrapped sessions.
 */
export function getUserLanguage( user: User | null | undefined ): string {
	if ( ! user ) {
		return 'en';
	}

	const slug = user.localeVariant || user.localeSlug || user.locale_variant || user.language;
	if ( ! slug ) {
		return 'en';
	}

	const checkAgainst = user.localeVariant || slug;
	if ( user.use_fallback_for_incomplete_languages && isTranslatedIncompletely( checkAgainst ) ) {
		return 'en';
	}

	return slug;
}

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
