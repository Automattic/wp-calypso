import type { AtomicTransfer, AtomicTransferError } from './actions';
import type { AppState } from 'calypso/types';

import 'calypso/state/atomic/init';

const emptyData = {};

export const getLatestAtomicTransfer = (
	state: AppState,
	siteId: number | null
): { transfer?: AtomicTransfer; error?: AtomicTransferError } =>
	siteId ? state?.atomicTransfers?.[ siteId ] ?? emptyData : emptyData;
