/**
 * Internal dependencies
 */
import { Threat } from 'calypso/components/jetpack/threat-item/types';

type ScanState = 'unavailable' | 'provisioning' | 'idle' | 'scanning';

// @todo: we should reflect the different states somehow in our Scan type.
// For instance, if the state is 'scanning', TS should be able to infer that
// the current is going to exist and the mostRecent won't. How we can do that?
// We want to avoid having a huge type full of conditional to make it work for
// all possible states.
export type Scan = {
	state: ScanState;
	threats: [ Threat ];
	credentials: [ object ];
	reason?: string;
	mostRecent?: {
		timestamp: string;
		progress: number;
		isInitial: boolean;
		duration: number;
		error: boolean;
	};
	current?: {
		timestamp: string;
		progress: number;
		isInitial: boolean;
	};
};

export type Site = {
	ID: number;
	name: string;
	URL: string;
};
