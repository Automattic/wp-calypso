import { useExperiment } from 'calypso/lib/explat';

export function useMigrationExperiment() {
	const [ , experimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_site_migration_flow_202501_v1'
	);

	return 'treatment' === experimentAssignment?.variationName;
}
