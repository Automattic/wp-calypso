/**
 * Internal dependencies
 */
import {
	purchaseFlow as purchaseFlowReducer,
	defaultState as defaultMarketPlaceState,
} from 'calypso/state/plugins/marketplace/reducer';
import {
	setPrimaryDomainCandidate,
	setPluginSlugToBeInstalled,
	setIsPluginInstalledDuringPurchase,
} from 'calypso/state/plugins/marketplace/actions';

describe( 'Marketplace reducer', () => {
	test( 'purchaseFlow reducer should default to an empty object', () => {
		const recievedState = purchaseFlowReducer( defaultMarketPlaceState, {
			type: 'SOME_RANDOM_ACTION',
		} );
		expect( recievedState ).toEqual( defaultMarketPlaceState );
	} );

	test( 'should set the primary domain for the purchase flow', () => {
		const domainName = 'awesome.com';
		const action = setPrimaryDomainCandidate( domainName );

		const recievedState = purchaseFlowReducer( defaultMarketPlaceState, action );
		const expectedState = {
			...defaultMarketPlaceState,
			primaryDomain: domainName,
		};

		expect( recievedState ).toEqual( expectedState );
	} );

	test( 'should set the plugin slug to be installed', () => {
		const pluginSlugToBeInstalled = 'wordpress-seo';
		const action = setPluginSlugToBeInstalled( pluginSlugToBeInstalled );

		const recievedState = purchaseFlowReducer( defaultMarketPlaceState, action );

		const expectedState = {
			...defaultMarketPlaceState,
			pluginSlugToBeInstalled,
		};

		expect( recievedState ).toEqual( expectedState );
	} );

	test( 'should set flag to indicate if plugin was istalled during checkout purchase', () => {
		const pluginSlugToBeInstalled = 'wordpress-seo';
		const action = setIsPluginInstalledDuringPurchase( pluginSlugToBeInstalled );

		const recievedState = purchaseFlowReducer( defaultMarketPlaceState, action );

		const expectedState = {
			...defaultMarketPlaceState,
			pluginSlugToBeInstalled,
		};

		expect( recievedState ).toEqual( expectedState );
	} );
} );
