type State = {
	sites?: {
		launch?: {
			inProgress?: number[];
			celebrationModalOpen?: boolean;
		};
	};
};

export const getIsSiteLaunchInProgress = ( state: State, siteId: number ) => {
	const siteLaunchesInProgress = state?.sites?.launch?.inProgress;
	if ( ! Array.isArray( siteLaunchesInProgress ) ) {
		false;
	}
	return siteLaunchesInProgress?.includes( siteId );
};

export const getIsSiteLaunchCelebrationModalOpen = ( state: State ) => {
	return state?.sites?.launch?.celebrationModalOpen;
};
