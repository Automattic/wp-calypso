import { AppState } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isUserEligibleForFreeHostingTrial = ( _state: AppState ) => {
	// Disable free hosting trials - see pMz3w-k4H-p2#comment-119368
	return false;
};
