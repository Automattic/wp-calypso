import type { AtomicTransfer } from './actions';
import type { AppState } from 'calypso/types';

import 'calypso/state/atomic/init';

export const getLatestAtomicTransfer = (
	state: AppState,
	siteId: number
): { transfer: AtomicTransfer; error: Error } =>
	state?.atomicTransfers?.[ siteId ] || { transfer: null, error: null };
