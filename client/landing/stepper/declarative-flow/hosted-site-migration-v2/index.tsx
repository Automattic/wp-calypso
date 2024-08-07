import { HOSTED_SITE_MIGRATION_V2_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { type Flow } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { stepsWithRequiredLogin } from '../../utils/steps-with-required-login';
import { STEPS } from '../internals/steps';
import { ProvidedDependencies } from '../internals/types';

export default {
	name: HOSTED_SITE_MIGRATION_V2_FLOW,
	get title() {
		return translate( 'Site Migration' );
	},
	isSignupFlow: false,
	useSteps() {
		return stepsWithRequiredLogin( [
			STEPS.PLATFORM_IDENTIFICATION,
			STEPS.SITE_CREATION_STEP,
			STEPS.PROCESSING,
			STEPS.SITE_MIGRATION_UPGRADE_PLAN,
		] );
	},

	useStepNavigation( currentStep, navigate ) {
		return {
			submit: ( props?: ProvidedDependencies ) => {
				if ( currentStep === STEPS.PLATFORM_IDENTIFICATION.slug ) {
					return navigate( STEPS.SITE_CREATION_STEP.slug );
				}

				if ( currentStep === STEPS.SITE_CREATION_STEP.slug ) {
					return navigate(
						addQueryArgs( STEPS.PROCESSING.slug, {
							siteId: props?.siteId,
							siteSlug: props?.siteSlug,
						} )
					);
				}

				if ( currentStep === STEPS.PROCESSING.slug ) {
					return navigate(
						addQueryArgs( STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug, {
							siteId: props?.siteId,
							siteSlug: props?.siteSlug,
						} )
					);
				}
			},
		};
	},
} satisfies Flow;
