import { HOSTED_SITE_MIGRATION_V2_FLOW } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { type Flow } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { stepsWithRequiredLogin } from '../../utils/steps-with-required-login';
import { STEPS } from '../internals/steps';

export default {
	name: HOSTED_SITE_MIGRATION_V2_FLOW,
	get title() {
		return translate( 'Site Migration' );
	},
	isSignupFlow: false,
	useSteps() {
		return stepsWithRequiredLogin( [ STEPS.IMPORT_OR_MIGRATE_WITH_UPGRADE ] );
	},

	//TEMP: This is a temporary implementation to make the flow work
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	useStepNavigation( currentStep, navigate ) {
		return {
			submit: () => alert( 'Go' ),
		};
	},
} satisfies Flow;
