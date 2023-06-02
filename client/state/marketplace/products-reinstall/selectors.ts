import 'calypso/state/marketplace/init';
import { IAppState } from 'calypso/state/types';
import { IReinstallProductsStatus } from '../types';

export function isReinstallingProducts( state: IAppState, siteId: number ) {
	return (
		state?.marketplace?.reinstallProducts?.[ siteId ]?.status ===
		IReinstallProductsStatus.IN_PROGRESS
	);
}

export function failedReinstallingProducts( state: IAppState, siteId: number ) {
	return (
		state?.marketplace?.reinstallProducts?.[ siteId ]?.status === IReinstallProductsStatus.FAILED
	);
}

export function completedReinstallingProducts( state: IAppState, siteId: number ) {
	return (
		state?.marketplace?.reinstallProducts?.[ siteId ]?.status === IReinstallProductsStatus.COMPLETED
	);
}

export function requestedReinstallProducts( state: IAppState, siteId: number ) {
	return (
		state?.marketplace?.reinstallProducts?.[ siteId ]?.status ===
			IReinstallProductsStatus.COMPLETED ||
		state?.marketplace?.reinstallProducts?.[ siteId ]?.status === IReinstallProductsStatus.FAILED
	);
}
