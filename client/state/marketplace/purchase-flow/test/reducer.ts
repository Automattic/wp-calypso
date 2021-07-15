/**
 * Internal dependencies
 */
import {
	default as purchaseFlowReducer,
	defaultState as defaultMarketPlaceState,
} from 'calypso/state/marketplace/purchase-flow/reducer';
import {
	pluginInstallationStateChange,
	setPrimaryDomainCandidate,
	siteTransferStateChange,
	siteTransferWithPluginInstallTriggered,
} from 'calypso/state/marketplace/purchase-flow/actions';
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

	test( 'should set the primary domain for the purchase flow', () => {
		const domainName = 'awesome.com';
		const action = setPrimaryDomainCandidate( domainName );

		const receivedState = purchaseFlowReducer( defaultMarketPlaceState, action );
		const expectedState = {
			...defaultMarketPlaceState,
			primaryDomain: domainName,
		};

		expect( receivedState ).toEqual( expectedState );
	} );

	test( 'If a transfer happens along with plugin install it should update the state as indicated', () => {
		const action = siteTransferWithPluginInstallTriggered();

		const receivedState = purchaseFlowReducer( defaultMarketPlaceState, action );
		const expectedState: IPurchaseFlowState = {
			...defaultMarketPlaceState,
			isPluginInstalledAlongWithTransfer: true,
			pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.IN_PROGRESS,
			siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.IN_PROGRESS,
		};

		expect( receivedState ).toEqual( expectedState );
	} );

	test( 'Plugin installation status changes should update the state and reason as indicated', () => {
		const reason = 'An error occurred due to transfer failure';
		let action = pluginInstallationStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR, reason );
		let receivedState = purchaseFlowReducer( defaultMarketPlaceState, action );
		let expectedState: IPurchaseFlowState = {
			...defaultMarketPlaceState,
			pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR,
			reasonForPluginInstallationStatus: reason,
		};
		expect( receivedState ).toEqual( expectedState );

		action = pluginInstallationStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR );
		receivedState = purchaseFlowReducer( defaultMarketPlaceState, action );
		expectedState = {
			...defaultMarketPlaceState,
			pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR,
			reasonForPluginInstallationStatus: 'NOT_PROVIDED',
		};
		expect( receivedState ).toEqual( expectedState );
	} );

	test( 'Transfer status changes should update the state as indicated', () => {
		const reason = 'An error occurred due to transfer failure';
		let action = siteTransferStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR, reason );
		let receivedState = purchaseFlowReducer( defaultMarketPlaceState, action );
		let expectedState: IPurchaseFlowState = {
			...defaultMarketPlaceState,
			siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR,
			reasonForSiteTransferStatus: reason,
		};
		expect( receivedState ).toEqual( expectedState );

		action = siteTransferStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR );
		receivedState = purchaseFlowReducer( defaultMarketPlaceState, action );
		expectedState = {
			...defaultMarketPlaceState,
			siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR,
			reasonForSiteTransferStatus: 'NOT_PROVIDED',
		};
		expect( receivedState ).toEqual( expectedState );
	} );

	test( 'When a plugin installation happens together with a transfer, update state as indicated', () => {
		let action = siteTransferWithPluginInstallTriggered();
		let state = purchaseFlowReducer( defaultMarketPlaceState, action );
		let expectedState: IPurchaseFlowState = {
			...defaultMarketPlaceState,
			siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.IN_PROGRESS,
			pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.IN_PROGRESS,
			isPluginInstalledAlongWithTransfer: true,
		};
		expect( state ).toEqual( expectedState );

		action = siteTransferStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED );
		state = purchaseFlowReducer( state, action );
		expectedState = {
			...defaultMarketPlaceState,
			siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED,
			pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED,
			isPluginInstalledAlongWithTransfer: true,
			reasonForPluginInstallationStatus: 'Site transfer and plugin install done together',
			reasonForSiteTransferStatus: 'Site transfer and plugin install done together',
		};
		expect( state ).toEqual( expectedState );
	} );
} );
