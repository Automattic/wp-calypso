/**
 * Internal dependencies
 */
import {
	purchaseFlow as purchaseFlowReducer,
	defaultState as defaultMarketPlaceState,
} from '../reducer';
import { setPrimaryDomain } from 'calypso/state/plugins/marketplace/actions';

describe( 'Marketplace reducer', () => {
	test( 'purchaseFlow reducer should default to an empty object', () => {
		const recievedState = purchaseFlowReducer( defaultMarketPlaceState, {
			type: 'SOME_RANDOM_ACTION',
		} );
		expect( recievedState ).toEqual( defaultMarketPlaceState );
	} );

	test( 'should set the primary domain for the purchase flow', () => {
		const domainName = 'awesome.com';
		const recievedState = purchaseFlowReducer(
			defaultMarketPlaceState,
			setPrimaryDomain( domainName )
		);
		const expectedState = { primaryDomain: domainName };

		// console.log( { recievedState, expectedState } );
		expect( recievedState ).toEqual( expectedState );
	} );
} );
