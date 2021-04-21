/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';
import { isEnabled } from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import { Step, useIsAnchorFm, useCurrentStep, usePath } from '../path';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { PLANS_STORE } from '../stores/plans';
import { usePlanFromPath } from './use-selected-plan';

import type { StepType } from '../path';

export default function useSteps(): {
	getNextStepPath: ( excludedSteps?: StepType[] ) => string;
	previousStepPath: string;
	isLastStep: boolean;
} {
	const locale = useLocale();
	const makePath = usePath();
	const { hasSiteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ) );
	const isAnchorFmSignup = useIsAnchorFm();

	let steps: StepType[];

	// If anchor_podcast param, show Intent Gathering, Design, and Style steps.
	if ( isAnchorFmSignup ) {
		steps = [ Step.IntentGathering, Step.DesignSelection, Step.Style ];
		// If site title is skipped, we're showing Domains step before Features step. If not, we are showing Domains step next.
	} else if ( hasSiteTitle() ) {
		steps = [
			Step.IntentGathering,
			Step.Domains,
			Step.DesignSelection,
			Step.Style,
			Step.Features,
			Step.Plans,
		];
	} else {
		steps = [
			Step.IntentGathering,
			Step.DesignSelection,
			Step.Style,
			Step.Domains,
			Step.Features,
			Step.Plans,
		];
	}

	// Remove the Style (fonts) step from the Site Editor flow.
	if ( isEnabled( 'gutenboarding/site-editor' ) ) {
		steps = steps.filter( ( step ) => step !== Step.Style );
	}

	// Logic necessary to skip Domains or Plans steps
	// General rule: if a step has been used already, don't remove it.
	const { domain, hasUsedDomainsStep, hasUsedPlansStep, selectedDesign } = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getState()
	);
	const planProductId = useSelect( ( select ) => select( ONBOARD_STORE ).getPlanProductId() );
	const plan = useSelect( ( select ) =>
		select( PLANS_STORE ).getPlanByProductId( planProductId, locale )
	);
	const hasPlanFromPath = !! usePlanFromPath();

	if ( domain && ! hasUsedDomainsStep ) {
		steps = steps.filter( ( step ) => step !== Step.Domains );
	}

	// Don't show the mandatory Plans steps:
	// - if the user landed from a marketing page after selecting a plan
	// - if a plan has been explicitly selected using the PlansModal
	if ( ( hasPlanFromPath || plan ) && ! hasUsedPlansStep ) {
		steps = steps.filter( ( step ) => step !== Step.Plans );
	}

	if ( selectedDesign?.slug === 'blank-canvas' ) {
		steps = steps.filter( ( step ) => step !== Step.Style );
	}

	const currentStep = useCurrentStep();
	const getCurrentStepIndex = ( steps: StepType[] ) =>
		steps.findIndex( ( step ) => step === Step[ currentStep ] );

	const getNextStepPath = ( excludedSteps?: StepType[] ) => {
		// Filter out any step that is explicitly excluded
		let actualSteps = steps;
		if ( Array.isArray( excludedSteps ) ) {
			actualSteps = actualSteps.filter( ( step ) => ! excludedSteps.includes( step ) );
		}

		const currentStepIndex = getCurrentStepIndex( actualSteps );

		return currentStepIndex !== -1 && // check first if current step still exists
			currentStepIndex < actualSteps.length - 1
			? makePath( actualSteps[ currentStepIndex + 1 ] )
			: '';
	};

	// we ignore this for now
	const previousStepPath =
		getCurrentStepIndex( steps ) > 0 ? makePath( steps[ getCurrentStepIndex( steps ) - 1 ] ) : '';

	// ignore this as well
	const isLastStep = getCurrentStepIndex( steps ) === steps.length - 1;

	return { getNextStepPath, previousStepPath, isLastStep };
}
