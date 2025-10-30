import { useAuth } from '../auth';

type BootstrappedLocaleFields = {
	localeSlug?: string;
	localeVariant?: string;
};

export function useLocale() {
	const { user } = useAuth();
	const u = user as typeof user & BootstrappedLocaleFields;
	return u.localeVariant || u.localeSlug || user.locale_variant || user.language || 'en';
}
