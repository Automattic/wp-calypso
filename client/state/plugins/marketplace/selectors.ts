/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';
import { IAppState } from '../reducer';
import { IPurchaseFlowState } from './types';

export function getPrimaryDomainCandidate( state: IAppState ): string | undefined {
	return state.plugins.marketplace.purchaseFlow.primaryDomain;
}

export function getPurchaseFlowState( state: IAppState ): IPurchaseFlowState {
	return state.plugins.marketplace.purchaseFlow;
}
