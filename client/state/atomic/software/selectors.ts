import type { AtomicSoftwareStatus } from './actions';
import type { AppState } from 'calypso/types';
import 'calypso/state/atomic/init';

export const getAtomicSoftwareStatus = (
	state: AppState,
	siteId: number,
	softwareSet: string
): { status: AtomicSoftwareStatus; error: Error } =>
	state?.atomicSoftware?.[ siteId ]?.[ softwareSet ] || { status: null, error: null };
