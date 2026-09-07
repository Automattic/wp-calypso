import { useIntlLocale } from '../locale';

const useIntlCollator = () => {
	const userLocale = useIntlLocale();

	// Backup locale in case the user's locale isn't supported
	const backupLocale = 'en';

	return new Intl.Collator( [ userLocale, backupLocale ] );
};

export default useIntlCollator;
