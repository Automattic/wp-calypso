import type { AtomicTransfer } from './actions';
import type { AppState } from 'calypso/types';

import 'calypso/state/atomic/init';

export const getAtomicTransferStatus = ( state: AppState, siteId: number ): AtomicTransfer =>
	state?.atomicTransfers?.[ siteId ] || {};
