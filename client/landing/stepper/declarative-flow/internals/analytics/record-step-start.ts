import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const recordStepStart = (
	flow: string,
	step: string,
	optionalProps?: { [ key: string ]: unknown }
) => {
	recordTracksEvent( 'calypso_signup_step_start', {
		flow,
		step,
		device: resolveDeviceTypeByViewPort(),
		...optionalProps,
	} );
};

export default recordStepStart;
