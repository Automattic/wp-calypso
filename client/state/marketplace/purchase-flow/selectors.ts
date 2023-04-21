import 'calypso/state/marketplace/init';
import {
	IPurchaseFlowState,
	MARKETPLACE_ASYNC_PROCESS_STATUS,
} from 'calypso/state/marketplace/types';
import { IAppState } from 'calypso/state/types';

export function getPurchaseFlowState( state: IAppState ): IPurchaseFlowState {
	return (
		state?.marketplace?.purchaseFlow ?? {
			primaryDomain: null,
			productSlugInstalled: null,
			pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
		}
	);
}
