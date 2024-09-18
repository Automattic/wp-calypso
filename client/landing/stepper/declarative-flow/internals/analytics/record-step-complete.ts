import { recordTracksEvent } from '@automattic/calypso-analytics';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { STEPPER_TRACKS_EVENT_STEP_COMPLETE } from 'calypso/landing/stepper/constants';

export interface RecordStepCompleteProps {
	flow: string;
	step: string;
	optionalProps?: Record< string, string | number | null >;
}

const recordStepComplete = ( { flow, step, optionalProps }: RecordStepCompleteProps ) => {
	recordTracksEvent( STEPPER_TRACKS_EVENT_STEP_COMPLETE, {
		flow,
		step,
		device: resolveDeviceTypeByViewPort(),
		...optionalProps,
	} );
};

export default recordStepComplete;
