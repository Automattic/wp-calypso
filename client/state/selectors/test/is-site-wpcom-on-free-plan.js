/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import isSiteWPCOMOnFreePlan from '../is-site-wpcom-on-free-plan';
import { PLAN_BUSINESS, PLAN_FREE, PLAN_JETPACK_FREE } from '@automattic/calypso-products';

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
		expect( isSiteWPCOMOnFreePlan( state, wpcomSite, wpcomSite.ID ) ).toEqual( false );
	} );

	test( 'should return false when wpcom site and on business wpcom plan', () => {
		expect(
			isSiteWPCOMOnFreePlan(
				state,
				{ wpcomSite, plan: { product_slug: PLAN_BUSINESS } },
				wpcomSite.ID
			)
		).toEqual( false );
	} );

	test( 'should return true when wpcom site and on free wpcom plan', () => {
		expect(
			isSiteWPCOMOnFreePlan( state, { wpcomSite, plan: { product_slug: PLAN_FREE } }, wpcomSite.ID )
		).toEqual( true );
	} );

	test( 'should return true when wpcom site, atomic, and on free jetpack plan', () => {
		expect(
			isSiteWPCOMOnFreePlan(
				state,
				{ atomicSite, plan: { product_slug: PLAN_JETPACK_FREE } },
				atomicSite.ID
			)
		).toEqual( true );
	} );

	test( 'should return false when jetpack site and on free jetpack plan', () => {
		expect(
			isSiteWPCOMOnFreePlan(
				state,
				{ jetpackSite, plan: { product_slug: PLAN_JETPACK_FREE } },
				jetpackSite.ID
			)
		).toEqual( false );
	} );
} );
