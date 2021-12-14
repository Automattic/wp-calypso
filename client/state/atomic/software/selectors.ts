import type { AtomicSoftwareStatus } from './actions';
import type { AppState } from 'calypso/types';
import 'calypso/state/atomic/init';

export const getAtomicSoftwareStatus = (
	state: AppState,
	siteId: number,
	softwareSet: string
): AtomicSoftwareStatus => state?.atomicSoftware?.[ siteId ]?.[ softwareSet ] || {};
