import type { AppState } from 'calypso/types';

import 'calypso/state/staging-site/init';

const emptyData = {};

export const getStagingSiteInfo = ( state: AppState, siteId: number | null ) =>
	siteId ? state?.stagingSite?.[ siteId ] ?? emptyData : emptyData;
