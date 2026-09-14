import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import {
	STEPPER_TRACKS_EVENT_SIGNUP_STEP_START,
	WOO_HOSTING_SOLUTIONS_REF,
} from 'calypso/landing/stepper/constants';
import { getVisualSplitPlansIntent } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/unified-plans/util';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const recordStepStart = (
	flow: string,
	step: string,
	optionalProps?: { [ key: string ]: unknown }
) => {
	const search = new URLSearchParams( window.location.search );
	const plansIntent =
		search.get( 'ref' ) === WOO_HOSTING_SOLUTIONS_REF
			? 'plans-woo-hosting-solutions'
			: getVisualSplitPlansIntent( search.get( 'intent' ) );

	recordTracksEvent( STEPPER_TRACKS_EVENT_SIGNUP_STEP_START, {
		flow,
		step,
		device: resolveDeviceTypeByViewPort(),
		plans_intent: plansIntent || 'default',
		...optionalProps,
	} );
};

export default recordStepStart;
