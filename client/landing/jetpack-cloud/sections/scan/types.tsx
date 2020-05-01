/**
 * Internal dependencies
 */
import { Threat } from 'landing/jetpack-cloud/components/threat-item/types';

type ScanState = 'unavailable' | 'provisioning' | 'idle' | 'scanning';

export type Scan = {
	state: ScanState;
	threats: [ Threat ];
	credentials: [ object ];
	mostRecent: {
		timestamp: Date;
		progress: number;
		duration: number;
		// @todo: complete the error prop when we know what the shape will it have
		error: string | object;
		isInitial: boolean;
	};
};
