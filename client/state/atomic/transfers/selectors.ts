import type { AtomicTransfer, AtomicTransferError } from './actions';
import type { AppState } from 'calypso/types';

import 'calypso/state/atomic/init';

export const getLatestAtomicTransfer = (
	state: AppState,
	siteId: number
): { transfer?: AtomicTransfer; error?: AtomicTransferError } =>
	state?.atomicTransfers?.[ siteId ] || {};
