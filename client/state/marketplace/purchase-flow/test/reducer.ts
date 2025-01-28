import { pluginInstallationStateChange } from 'calypso/state/marketplace/purchase-flow/actions';
import {
	default as purchaseFlowReducer,
	defaultState as defaultMarketPlaceState,
} from 'calypso/state/marketplace/purchase-flow/reducer';
import {
	IPurchaseFlowState,
	MARKETPLACE_ASYNC_PROCESS_STATUS,
} from 'calypso/state/marketplace/types';

describe( 'Purchase Flow states test suite', () => {
	test( 'purchaseFlow reducer should default to an empty object', () => {
		const receivedState = purchaseFlowReducer( defaultMarketPlaceState, {
			type: 'SOME_RANDOM_ACTION',
		} );
		expect( receivedState ).toEqual( defaultMarketPlaceState );
	} );

	test( 'Plugin installation status changes should update the state and reason as indicated', () => {
		const reason = 'An error occurred due to transfer failure';
		let action = pluginInstallationStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR, reason );
		let receivedState = purchaseFlowReducer( defaultMarketPlaceState, action );
		let expectedState: IPurchaseFlowState = {
			...defaultMarketPlaceState,
			pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR,
		};
		expect( receivedState ).toEqual( expectedState );

		action = pluginInstallationStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR );
		receivedState = purchaseFlowReducer( defaultMarketPlaceState, action );
		expectedState = {
			...defaultMarketPlaceState,
			pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR,
		};
		expect( receivedState ).toEqual( expectedState );
	} );
} );
