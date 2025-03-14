import configApi from '@automattic/calypso-config';
import { SITE_SETUP_FLOW } from '@automattic/onboarding';

const FLOWS_USING_STEP_CONTAINER_V2 = [ SITE_SETUP_FLOW ];

export const shouldUseStepContainerV2 = ( flow: string ) => {
	return (
		configApi.isEnabled( 'onboarding/step-container-v2' ) &&
		FLOWS_USING_STEP_CONTAINER_V2.includes( flow )
	);
};
