import { STEPS } from '../internals/steps';

export const shouldRedirectToSiteMigration = (
	step: string,
	platform: string,
	origin?: string | null,
	ref?: string | null
) => {
	return (
		step === STEPS.IMPORT_LIST.slug &&
		platform === 'wordpress' &&
		( origin === STEPS.SITE_MIGRATION_IDENTIFY.slug || ref === 'wp-admin-importers-list' )
	);
};
