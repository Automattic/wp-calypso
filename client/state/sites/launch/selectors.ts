type State = {
	sites?: {
		launch?: {
			inProgress?: number[];
			celebration?: number[];
		};
	};
};

export const getIsSiteLaunchInProgress = ( state: State, siteId: number ) => {
	const siteLaunchesInProgress = state?.sites?.launch?.inProgress;
	if ( ! Array.isArray( siteLaunchesInProgress ) ) {
		return false;
	}
	return siteLaunchesInProgress?.includes( siteId );
};

export const getIsSiteLaunchCelebration = ( state: State, siteId: number ) => {
	const siteLaunchCelebration = state?.sites?.launch?.celebration;
	if ( ! Array.isArray( siteLaunchCelebration ) ) {
		return false;
	}
	return siteLaunchCelebration?.includes( siteId );
};
