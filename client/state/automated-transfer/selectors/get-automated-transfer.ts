import type { AppState } from 'calypso/types';

import 'calypso/state/automated-transfer/init';

const emptyData = {};

export const getAutomatedTransfer = ( state: AppState, siteId: number | null ) =>
	siteId ? state?.automatedTransfer?.[ siteId ] ?? emptyData : emptyData;
