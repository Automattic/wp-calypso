import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export const recordFlowStart = ( flow: string, optionalProps?: Record< string, any > ) => {
	recordTracksEvent( 'calypso_stepper_flow_start', {
		flow,
		device: resolveDeviceTypeByViewPort(),
		...optionalProps,
	} );
};
