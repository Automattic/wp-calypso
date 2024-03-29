import { englishLocales } from '@automattic/i18n-utils';
import { STEPS } from '../internals/steps';

export const shouldRedirectToSiteMigration = (
	step: string,
	platform: string,
	locale: string,
	origin?: string | null
) => {
	const isEnglishLocale = englishLocales.includes( locale );
	return (
		step === STEPS.IMPORT_LIST.slug &&
		platform === 'wordpress' &&
		isEnglishLocale &&
		origin === STEPS.SITE_MIGRATION_IDENTIFY.slug
	);
};
