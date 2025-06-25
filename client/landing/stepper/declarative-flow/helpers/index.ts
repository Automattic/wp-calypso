import { STEPS } from '../internals/steps';

export const shouldRedirectToSiteMigration = (
	step: string,
	platform: string,
	origin?: string | null,
	entryPoint?: string | null
) => {
	return (
		step === STEPS.IMPORT_LIST.slug &&
		platform === 'wordpress' &&
		( origin === STEPS.SITE_MIGRATION_IDENTIFY.slug || entryPoint === 'wp-admin-importers-list' )
	);
};
