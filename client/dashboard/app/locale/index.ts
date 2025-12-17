import { User } from '@automattic/api-core';
import { useAuth } from '../auth';

type ComputedAttributes = {
	localeSlug?: string;
	localeVariant?: string;
};

export function useLocale() {
	const { user } = useAuth();
	const u = user as typeof user & ComputedAttributes;

	return getLocaleFromUser( u );
}

export function getLocaleFromUser( u: User ): string {
	return u.localeVariant || u.localeSlug || u.locale_variant || u.language || 'en';
}
