import { useAuth } from '../auth';

export function useLocale() {
	const { user } = useAuth();
	return user.locale_variant || user.language || 'en';
}
