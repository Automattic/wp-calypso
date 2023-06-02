import type { AtomicSoftwareStatus, AtomicSoftwareError } from './actions';
import type { AppState } from 'calypso/types';
import 'calypso/state/atomic/init';

export const getAtomicSoftwareStatus = (
	state: AppState,
	siteId: number,
	softwareSet: string
): { status?: AtomicSoftwareStatus; error?: AtomicSoftwareError } =>
	state?.atomicSoftware?.[ siteId ]?.[ softwareSet ] || {};
