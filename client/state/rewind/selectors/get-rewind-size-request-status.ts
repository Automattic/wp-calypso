import type { AppState } from 'calypso/types';

const getRewindSizeRequestStatus = (
	state: AppState,
	siteId: number | null
): string | undefined => {
	if ( ! Number.isInteger( siteId ) ) {
		return undefined;
	}

	return state.rewind?.[ siteId as number ]?.size?.requestStatus;
};

export default getRewindSizeRequestStatus;
