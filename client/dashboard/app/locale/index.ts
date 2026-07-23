import { useAuth } from '../auth';
import { useSessionLocale } from './session-locale';

type ComputedAttributes = {
	localeSlug?: string;
	localeVariant?: string;
};

export function useLocale() {
	const { user } = useAuth();
	const sessionLocale = useSessionLocale();
	if ( sessionLocale ) {
		return sessionLocale;
	}

	const u = user as typeof user & ComputedAttributes;
	return u.localeVariant || u.localeSlug || user.locale_variant || user.language || 'en';
}
