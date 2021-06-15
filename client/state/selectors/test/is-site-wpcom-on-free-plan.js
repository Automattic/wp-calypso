/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import isSiteWPCOMOnFreePlan from '../is-site-wpcom-on-free-plan';
import { PLAN_BUSINESS, PLAN_FREE, PLAN_JETPACK_FREE } from '@automattic/calypso-products';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getCurrentPlan: require( 'sinon' ).stub(),
} ) );

describe( 'isSiteWPCOMOnFreePlan', () => {
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

	test( 'should return false when plan is not known', () => {
		getCurrentPlan.returns( null );
		expect( isSiteWPCOMOnFreePlan( state, wpcomSite.ID ) ).toEqual( false );
	} );

	test( 'should return false when wpcom site and on business wpcom plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_BUSINESS } );
		expect( isSiteWPCOMOnFreePlan( state, wpcomSite.ID ) ).toEqual( false );
	} );

	test( 'should return true when wpcom site and on free wpcom plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_FREE } );
		expect( isSiteWPCOMOnFreePlan( state, wpcomSite.ID ) ).toEqual( true );
	} );

	test( 'should return true when wpcom site and on free Jetpack plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_FREE } );
		expect( isSiteWPCOMOnFreePlan( state, wpcomSite.ID ) ).toEqual( true );
	} );

	test( 'should return false when jetpack site and on free Jetpack plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_FREE } );
		expect( isSiteWPCOMOnFreePlan( state, jetpackSite.ID ) ).toEqual( false );
	} );
} );
