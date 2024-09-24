import { recordTracksEvent } from '@automattic/calypso-analytics';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { STEPPER_TRACKS_EVENT_SIGNUP_START } from 'calypso/landing/stepper/constants';

export interface RecordSignupStartProps {
	flow: string;
	ref: string;
	optionalProps?: Record< string, string | number | null >;
}

const recordSignupStart = ( { flow, ref, optionalProps }: RecordSignupStartProps ) => {
	recordTracksEvent( STEPPER_TRACKS_EVENT_SIGNUP_START, {
		flow,
		ref,
		device: resolveDeviceTypeByViewPort(),
		...optionalProps,
	} );
};

export default recordSignupStart;
