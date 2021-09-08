import type { AppState } from 'calypso/types';

const getRewindPoliciesRequestStatus = (
	state: AppState,
	siteId: number | null
): string | undefined => {
	if ( ! Number.isInteger( siteId ) ) {
		return undefined;
	}

	return state.rewind?.[ siteId as number ]?.policies?.requestStatus;
};

export default getRewindPoliciesRequestStatus;
