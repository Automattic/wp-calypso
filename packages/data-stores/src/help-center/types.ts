import * as actions from './actions';
import type { DispatchFromMap } from '../mapped-types';

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}

export interface HasSeenWhatsNewModalFetch {
	has_seen_whats_new_modal: boolean;
}
