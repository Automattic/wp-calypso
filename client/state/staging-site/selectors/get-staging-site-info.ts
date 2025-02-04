import type { AppState } from 'calypso/types';

import 'calypso/state/staging-site/init';

const emptyData = {};

export const getStagingSiteInfo = ( state: AppState, siteId: number | null ) => {
	if ( ! siteId ) {
		return emptyData;
	}
	if ( ! state?.stagingSite?.[ siteId ] ) {
		return emptyData;
	}
	return state?.stagingSite?.[ siteId ];
};
