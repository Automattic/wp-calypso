import { REWIND_SIZE_REQUEST } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/rewind/size';
import type { Action } from 'redux';

const trackRequests = {
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
};

type RequestActionType = Action< typeof REWIND_SIZE_REQUEST > &
	typeof trackRequests & {
		siteId: number | null;
	};

export const requestSize = ( siteId: number | null ): RequestActionType => ( {
	type: REWIND_SIZE_REQUEST,
	siteId,
	...trackRequests,
} );
