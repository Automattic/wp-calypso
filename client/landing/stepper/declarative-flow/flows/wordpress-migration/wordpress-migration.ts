import { WORDPRESS_MIGRATION_FLOW } from '@automattic/onboarding';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import type { FlowV2 } from '../../internals/types';

function initialize() {
	return stepsWithRequiredLogin( [ STEPS.ERROR ] );
}

const wordpressMigration: FlowV2< typeof initialize > = {
	name: WORDPRESS_MIGRATION_FLOW,
	isSignupFlow: false,
	__experimentalUseSessions: true,
	__experimentalUseBuiltinAuth: true,
	initialize,
	useStepNavigation() {
		return { submit: () => undefined };
	},
};

export default wordpressMigration;
