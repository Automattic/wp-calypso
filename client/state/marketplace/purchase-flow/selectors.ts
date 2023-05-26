import 'calypso/state/marketplace/init';
import { IPurchaseFlowState } from 'calypso/state/marketplace/types';
import { IAppState } from 'calypso/state/types';
import { defaultState } from './reducer';

export function getPurchaseFlowState( state: IAppState ): IPurchaseFlowState {
	return state?.marketplace?.purchaseFlow ?? defaultState;
}
