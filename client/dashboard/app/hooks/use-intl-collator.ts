import { useLocale } from '../locale';

const useIntlCollator = () => {
	const userLocale = useLocale();

	// Backup locale in case the user's locale isn't supported
	const backupLocale = 'en';

	const sortLocales = userLocale
		? /*
		   * Locale slugs could contain underscores, but Intl.Collator expects them to use dashes
		   * @see https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag
		   */
		  [ userLocale.replace( /_/g, '-' ), backupLocale ]
		: [ backupLocale ];

	return new Intl.Collator( sortLocales );
};

export default useIntlCollator;
