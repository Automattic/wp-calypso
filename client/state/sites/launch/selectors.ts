type State = {
	sites?: {
		launch?: {
			inProgress?: number[];
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
