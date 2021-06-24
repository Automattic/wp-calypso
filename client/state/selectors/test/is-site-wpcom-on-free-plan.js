/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import isSiteWPCOMOnFreePlan from '../is-site-wpcom-on-free-plan';
import { PLAN_BUSINESS, PLAN_FREE, PLAN_JETPACK_FREE } from '@automattic/calypso-products';
import { getSelectedSite } from 'calypso/state/ui/selectors';
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: require( 'sinon' ).stub(),
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
	const atomicSite = {
		ID: 3,
		jetpack: false,
		options: {
			is_automated_transfer: true,
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
		getSelectedSite.returns( null );
		expect( isSiteWPCOMOnFreePlan( state, wpcomSite.ID ) ).toEqual( false );
	} );

	test( 'should return false when wpcom site and on business wpcom plan', () => {
		getSelectedSite.returns( { wpcomSite, plan: { product_slug: PLAN_BUSINESS } } );
		expect( isSiteWPCOMOnFreePlan( state, wpcomSite.ID ) ).toEqual( false );
	} );

	test( 'should return true when wpcom site and on free wpcom plan', () => {
		getSelectedSite.returns( { wpcomSite, plan: { product_slug: PLAN_FREE } } );
		expect( isSiteWPCOMOnFreePlan( state, state, wpcomSite.ID ) ).toEqual( true );
	} );

	test( 'should return true when wpcom site, atomic, and on free jetpack plan', () => {
		getSelectedSite.returns( { atomicSite, plan: { product_slug: PLAN_JETPACK_FREE } } );
		expect( isSiteWPCOMOnFreePlan( state, atomicSite.ID ) ).toEqual( true );
	} );

	test( 'should return false when jetpack site and on free jetpack plan', () => {
		getSelectedSite.returns( { jetpackSite, plan: { product_slug: PLAN_JETPACK_FREE } } );
		expect( isSiteWPCOMOnFreePlan( state, jetpackSite.ID ) ).toEqual( false );
	} );
} );
