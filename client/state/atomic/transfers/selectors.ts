import type { AppState } from 'calypso/types';
import 'calypso/state/atomic/init';

export const getAtomicTransferStatus = ( state: AppState, siteId: number ): any =>
	state?.atomicTransfers?.[ siteId ] || {};
