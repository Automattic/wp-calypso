import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { STEPPER_TRACKS_EVENT_SIGNUP_STEP_START } from 'calypso/landing/stepper/constants';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const recordStepStart = (
	flow: string,
	step: string,
	optionalProps?: { [ key: string ]: unknown }
) => {
	recordTracksEvent( STEPPER_TRACKS_EVENT_SIGNUP_STEP_START, {
		flow,
		step,
		device: resolveDeviceTypeByViewPort(),
		...optionalProps,
	} );
};

export default recordStepStart;
