import configApi from '@automattic/calypso-config';
import { SITE_SETUP_FLOW, ONBOARDING_FLOW, SITE_MIGRATION_FLOW } from '@automattic/onboarding';

const FLOWS_USING_STEP_CONTAINER_V2 = [ SITE_SETUP_FLOW, ONBOARDING_FLOW, SITE_MIGRATION_FLOW ];

export const shouldUseStepContainerV2 = ( flow: string ) => {
	return (
		configApi.isEnabled( 'onboarding/step-container-v2' ) &&
		FLOWS_USING_STEP_CONTAINER_V2.includes( flow )
	);
};

export const shouldUseStepContainerV2MigrationFlow = ( flow: string ) => {
	return (
		configApi.isEnabled( 'onboarding/step-container-v2-migration-flow' ) &&
		FLOWS_USING_STEP_CONTAINER_V2.includes( flow )
	);
};

export const shouldUseStepContainerV2ImportFlow = ( flow: string ) => {
	return (
		configApi.isEnabled( 'onboarding/step-container-v2-import-flow' ) &&
		FLOWS_USING_STEP_CONTAINER_V2.includes( flow )
	);
};
