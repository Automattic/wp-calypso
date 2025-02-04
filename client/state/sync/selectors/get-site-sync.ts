import type { AppState } from 'calypso/types';

import 'calypso/state/sync/init';

const emptyData = {};

export const getSiteSync = ( state: AppState, siteId: number | null ) =>
	siteId ? state?.siteSync?.[ siteId ] ?? emptyData : emptyData;
