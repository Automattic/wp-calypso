/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	PLAN_FREE,
	PLAN_PERSONAL,
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
import hasSiteSeoFeature from '../has-site-seo-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: require( 'sinon' ).stub(),
} ) );

describe( 'hasSiteSeoFeature', () => {
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

	it( 'returns undefined if the site has no plan', () => {
		getSelectedSite.returns( null );
		expect( hasSiteSeoFeature( state, wpcomSite.ID ) ).toBeUndefined();
	} );

	// WPCOM plans

	it( 'returns false when on a wpcom free plan', () => {
		getSelectedSite.returns( { wpcomSite, plan: { product_slug: PLAN_FREE } } );
		expect( hasSiteSeoFeature( state, wpcomSite.ID ) ).toEqual( false );
	} );

	it( 'returns false when on a wpcom personal plan', () => {
		getSelectedSite.returns( { wpcomSite, plan: { product_slug: PLAN_PERSONAL } } );
		expect( hasSiteSeoFeature( state, wpcomSite.ID ) ).toEqual( false );
	} );

	it( 'returns false when on a wpcom premium plan', () => {
		getSelectedSite.returns( { wpcomSite, plan: { product_slug: PLAN_PREMIUM } } );
		expect( hasSiteSeoFeature( state, wpcomSite.ID ) ).toEqual( false );
	} );

	it( 'returns true when on a wpcom business plan', () => {
		getSelectedSite.returns( { wpcomSite, plan: { product_slug: PLAN_BUSINESS } } );
		expect( hasSiteSeoFeature( state, wpcomSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a wpcom ecommerce plan', () => {
		getSelectedSite.returns( { wpcomSite, plan: { product_slug: PLAN_ECOMMERCE } } );
		expect( hasSiteSeoFeature( state, wpcomSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a wpcom enterprise plan', () => {
		getSelectedSite.returns( { wpcomSite, plan: { product_slug: PLAN_WPCOM_ENTERPRISE } } );
		expect( hasSiteSeoFeature( state, wpcomSite.ID ) ).toEqual( true );
	} );

	// VIP sites use conflicting SEO plugins.
	it( 'returns false when on a wpcom VIP plan', () => {
		getSelectedSite.returns( { wpcomSite, plan: { product_slug: PLAN_VIP } } );
		expect( hasSiteSeoFeature( state, wpcomSite.ID ) ).toEqual( false );
	} );

	// Jetpack plans

	it( 'returns true when on a jetpack free plan', () => {
		getSelectedSite.returns( { jetpackSite, plan: { product_slug: PLAN_JETPACK_FREE } } );
		expect( hasSiteSeoFeature( state, jetpackSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a jetpack personal plan', () => {
		getSelectedSite.returns( { jetpackSite, plan: { product_slug: PLAN_JETPACK_PERSONAL } } );
		expect( hasSiteSeoFeature( state, jetpackSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a jetpack premium plan', () => {
		getSelectedSite.returns( { jetpackSite, plan: { product_slug: PLAN_JETPACK_PREMIUM } } );
		expect( hasSiteSeoFeature( state, jetpackSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a jetpack business plan', () => {
		getSelectedSite.returns( { jetpackSite, plan: { product_slug: PLAN_JETPACK_BUSINESS } } );
		expect( hasSiteSeoFeature( state, jetpackSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a jetpack security daily plan', () => {
		getSelectedSite.returns( { jetpackSite, plan: { product_slug: PLAN_JETPACK_SECURITY_DAILY } } );
		expect( hasSiteSeoFeature( state, jetpackSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a jetpack security realtime plan', () => {
		getSelectedSite.returns( {
			jetpackSite,
			plan: { product_slug: PLAN_JETPACK_SECURITY_REALTIME },
		} );
		expect( hasSiteSeoFeature( state, jetpackSite.ID ) ).toEqual( true );
	} );

	it( 'returns true when on a jetpack complete plan', () => {
		getSelectedSite.returns( { jetpackSite, plan: { product_slug: PLAN_JETPACK_COMPLETE } } );
		expect( hasSiteSeoFeature( state, jetpackSite.ID ) ).toEqual( true );
	} );
} );
