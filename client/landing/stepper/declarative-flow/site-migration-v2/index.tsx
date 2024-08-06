import { translate } from 'i18n-calypso';
import { type Flow } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { stepsWithRequiredLogin } from '../../utils/steps-with-required-login';
import { STEPS } from '../internals/steps';

export default {
	name: 'site-migration-v2',
	get title() {
		return translate( 'Site Migration' );
	},
	isSignupFlow: false,
	useSteps() {
		return stepsWithRequiredLogin( [ STEPS.IMPORT_OR_MIGRATE_WITH_UPGRADE ] );
	},

	useStepNavigation( currentStep, navigate ) {
		return {
			submit: () => navigate( STEPS.SITE_LAUNCH.slug ),
		};
	},
} satisfies Flow;
