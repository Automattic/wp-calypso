/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { Step, StepType, useIsAnchorFm } from '../path';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { usePlanFromPath } from './use-selected-plan';

export default function useSteps(): Array< StepType > {
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

	// Logic necessary to skip Domains or Plans steps
	// General rule: if a step has been used already, don't remove it.
	const { domain, hasUsedDomainsStep, hasUsedPlansStep } = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getState()
	);
	const plan = useSelect( ( select ) => select( ONBOARD_STORE ).getPlan() );
	const hasPlanFromPath = !! usePlanFromPath();

	if ( domain && ! hasUsedDomainsStep ) {
		steps = steps.filter( ( step ) => step !== Step.Domains );
	}

	// Don't show the mandatory Plans steps:
	// - if the user landed from a marketing page after selecting a plan (in this case, hide also the Features step)
	// - if a plan has been selected using the PlansModal but only if there is no Features step
	if ( ( hasPlanFromPath || plan ) && ! hasUsedPlansStep ) {
		steps = steps.filter( ( step ) => step !== Step.Plans );
	}

	return steps;
}
