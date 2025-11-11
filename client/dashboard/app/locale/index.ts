import { useAuth } from '../auth';

type ComputedAttributes = {
	localeSlug?: string;
	localeVariant?: string;
};

export function useLocale() {
	const { user } = useAuth();
	const u = user as typeof user & ComputedAttributes;
	return u.localeVariant || u.localeSlug || user.locale_variant || user.language || 'en';
}
