import 'calypso/state/marketplace/init';
import { IAppState } from 'calypso/state/types';
import { IReinstallProductsStatus } from '../types';

export function requestedReinstallProducts( state: IAppState, siteId: number ) {
	return (
		state?.marketplace?.reinstallProducts?.[ siteId ]?.status ===
			IReinstallProductsStatus.COMPLETED ||
		state?.marketplace?.reinstallProducts?.[ siteId ]?.status === IReinstallProductsStatus.FAILED
	);
}
