import { useExperiment } from 'calypso/lib/explat';

export function useMigrationExperiment( flowName: string ) {
	const [ , experimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_site_migration_flow_202501_v1'
	);

	return 'treatment' === experimentAssignment?.variationName && 'site-migration' === flowName;
}
