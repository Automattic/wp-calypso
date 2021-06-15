/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	PLAN_FREE,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_WPCOM_ENTERPRISE,
	PLAN_VIP,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_COMPLETE,
} from '@automattic/calypso-products';
import hasSiteAnalyticsFeature from '../has-site-analytics-feature';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getCurrentPlan: require( 'sinon' ).stub(),
} ) );

describe( 'hasSiteAnalyticsFeature', () => {
	const wpcomSite = {
		ID: 1,
		jetpack: false,
	};
	const jetpackSite = {
		ID: 2,
		jetpack: true,
		options: {
			is_automated_transfer: false,
		},
	};
	const state = deepFreeze( {
		sites: {
			items: {
				1: wpcomSite,
				2: jetpackSite,
			},
		},
	} );

	it( 'returns undefined if the state and siteId are not defined', () => {
		expect( hasSiteAnalyticsFeature() ).toBeUndefined();
	} );

	it( 'returns undefined if the site has no plan', () => {
		getCurrentPlan.returns( null );
		expect( hasSiteAnalyticsFeature( state, wpcomSite.ID ) ).toBeUndefined();
	} );

	// WPCOM plans

	it( 'returns false when on a wpcom free plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_FREE } );
		expect( hasSiteAnalyticsFeature( state, wpcomSite.ID ) ).toEqual( false );
	} );

	it( 'returns true when on a wpcom premium plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_PREMIUM } );
		expect( hasSiteAnalyticsFeature( state, wpcomSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a wpcom business plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_BUSINESS } );
		expect( hasSiteAnalyticsFeature( state, wpcomSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a wpcom ecommerce plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_ECOMMERCE } );
		expect( hasSiteAnalyticsFeature( state, wpcomSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a wpcom enterprise plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_WPCOM_ENTERPRISE } );
		expect( hasSiteAnalyticsFeature( state, wpcomSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a wpcom VIP plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_VIP } );
		expect( hasSiteAnalyticsFeature( state, wpcomSite.ID ) ).toEqual( true );
	} );

	// Jetpack plans

	it( 'returns false when on a jetpack free plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_FREE } );
		expect( hasSiteAnalyticsFeature( state, jetpackSite.ID ) ).toEqual( false );
	} );

	it( 'returns false when on a jetpack personal plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_PERSONAL } );
		expect( hasSiteAnalyticsFeature( state, jetpackSite.ID ) ).toEqual( false );
	} );

	it( 'returns true when on a jetpack premium plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_PREMIUM } );
		expect( hasSiteAnalyticsFeature( state, jetpackSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a jetpack business plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_BUSINESS } );
		expect( hasSiteAnalyticsFeature( state, jetpackSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a jetpack security daily plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_SECURITY_DAILY } );
		expect( hasSiteAnalyticsFeature( state, jetpackSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a jetpack security realtime plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_SECURITY_REALTIME } );
		expect( hasSiteAnalyticsFeature( state, jetpackSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a jetpack complete plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_COMPLETE } );
		expect( hasSiteAnalyticsFeature( state, jetpackSite.ID ) ).toEqual( true );
	} );
} );
