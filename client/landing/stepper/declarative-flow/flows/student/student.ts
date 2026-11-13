import { clearStepPersistedState, STUDENT_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import {
	clearSignupCompleteFlowName,
	clearSignupCompleteSiteID,
	clearSignupCompleteSlug,
	clearSignupDestinationCookie,
} from 'calypso/signup/storageUtils';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import education, { STUDENT_PLAN_SLUG } from '../education/education';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { OnboardActions, OnboardSelect } from '@automattic/data-stores';

function initialize() {
	const steps = [
		STEPS.STUDENT_PLAN_ELIGIBILITY,
		STEPS.DOMAIN_SEARCH,
		STEPS.USE_MY_DOMAIN,
		STEPS.SITE_CREATION_STEP,
		STEPS.PROCESSING,
		STEPS.ERROR,
	];

	return stepsWithRequiredLogin( steps );
}

/**
 * The self-serve Student plan flow. It differs from the education flow only in its first
 * step: the account email decides eligibility instead of an invitation code. The plan is
 * charged at its regular price; the free first year stays with invitation codes.
 */
const student: FlowV2< typeof initialize > = {
	name: STUDENT_FLOW,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	initialize,
	useStepsProps: education.useStepsProps,
	useStepNavigation( currentStepSlug, navigate ) {
		const { setPlanCartItem } = useDispatch( ONBOARD_STORE ) as OnboardActions;
		// The education flow reads the flow name from `this`, so its redirects stay in this flow.
		const { submit: submitEducationStep } = education.useStepNavigation.call(
			this,
			currentStepSlug as Parameters< typeof education.useStepNavigation >[ 0 ],
			navigate as Parameters< typeof education.useStepNavigation >[ 1 ]
		);

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			if ( submittedStep.slug === STEPS.STUDENT_PLAN_ELIGIBILITY.slug ) {
				if ( ! submittedStep.providedDependencies?.eligible ) {
					throw new Error( 'Student plan eligibility must be confirmed before continuing' );
				}

				setPlanCartItem( { product_slug: STUDENT_PLAN_SLUG } );
				// Replace the history entry: going back to the eligibility step would send an
				// eligible account straight forward again.
				return navigate( STEPS.DOMAIN_SEARCH.slug, undefined, true );
			}

			return submitEducationStep?.(
				submittedStep as Parameters< NonNullable< typeof submitEducationStep > >[ 0 ]
			);
		};

		return { submit };
	},
	useSideEffect( currentStepSlug, navigate ) {
		const reduxDispatch = useReduxDispatch();
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const planCartItem = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			[]
		);

		// Reset only at the flow root, not in `initialize`, which also runs on a mid-flow refresh.
		useEffect( () => {
			if ( ! currentStepSlug ) {
				resetOnboardStore();
				reduxDispatch( setSelectedSiteId( null ) );
				clearStepPersistedState( STUDENT_FLOW );
				clearSignupDestinationCookie();
				clearSignupCompleteFlowName();
				clearSignupCompleteSlug();
				clearSignupCompleteSiteID();
			}
		}, [ currentStepSlug, reduxDispatch, resetOnboardStore ] );

		// No Student plan in the cart on a later step means the user deep-linked past the
		// eligibility check, so send them back to it.
		useEffect( () => {
			const stepsRequiringEligibility: string[] = [
				STEPS.DOMAIN_SEARCH.slug,
				STEPS.USE_MY_DOMAIN.slug,
				STEPS.SITE_CREATION_STEP.slug,
				STEPS.PROCESSING.slug,
				STEPS.ERROR.slug,
			];

			if (
				currentStepSlug &&
				stepsRequiringEligibility.includes( currentStepSlug ) &&
				planCartItem?.product_slug !== STUDENT_PLAN_SLUG
			) {
				navigate( STEPS.STUDENT_PLAN_ELIGIBILITY.slug );
			}
		}, [ currentStepSlug, planCartItem, navigate ] );
	},
};

export default student;
