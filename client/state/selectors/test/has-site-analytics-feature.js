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
import hasSiteAnalyticsFeature from '../has-site-analytics-feature';

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
		expect( hasSiteAnalyticsFeature( state, wpcomSite, wpcomSite.ID ) ).toBeUndefined();
	} );

	// WPCOM plans

	it( 'returns false when on a wpcom free plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ wpcomSite, plan: { product_slug: PLAN_FREE } },
				wpcomSite.ID
			)
		).toEqual( false );
	} );

	it( 'returns false when on a wpcom personal plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ wpcomSite, plan: { product_slug: PLAN_PERSONAL } },
				wpcomSite.ID
			)
		).toEqual( false );
	} );

	it( 'returns true when on a wpcom premium plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ wpcomSite, plan: { product_slug: PLAN_PREMIUM } },
				wpcomSite.ID
			)
		).toEqual( true );
	} );

	it( 'returns true when on a wpcom business plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ wpcomSite, plan: { product_slug: PLAN_BUSINESS } },
				wpcomSite.ID
			)
		).toEqual( true );
	} );

	it( 'returns true when on a wpcom ecommerce plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ wpcomSite, plan: { product_slug: PLAN_ECOMMERCE } },
				wpcomSite.ID
			)
		).toEqual( true );
	} );

	it( 'returns true when on a wpcom enterprise plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ wpcomSite, plan: { product_slug: PLAN_WPCOM_ENTERPRISE } },
				wpcomSite.ID
			)
		).toEqual( true );
	} );

	it( 'returns true when on a wpcom VIP plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ wpcomSite, plan: { product_slug: PLAN_VIP } },
				wpcomSite.ID
			)
		).toEqual( true );
	} );

	// Jetpack plans

	it( 'returns false when on a jetpack free plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ jetpackSite, plan: { product_slug: PLAN_JETPACK_FREE } },
				jetpackSite.ID
			)
		).toEqual( false );
	} );

	it( 'returns false when on a jetpack personal plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ jetpackSite, plan: { product_slug: PLAN_JETPACK_PERSONAL } },
				jetpackSite.ID
			)
		).toEqual( false );
	} );

	it( 'returns true when on a jetpack premium plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ jetpackSite, plan: { product_slug: PLAN_JETPACK_PREMIUM } },
				jetpackSite.ID
			)
		).toEqual( true );
	} );

	it( 'returns true when on a jetpack business plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ jetpackSite, plan: { product_slug: PLAN_JETPACK_BUSINESS } },
				jetpackSite.ID
			)
		).toEqual( true );
	} );

	it( 'returns true when on a jetpack security daily plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ jetpackSite, plan: { product_slug: PLAN_JETPACK_SECURITY_DAILY } },
				jetpackSite.ID
			)
		).toEqual( true );
	} );

	it( 'returns true when on a jetpack security realtime plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ jetpackSite, plan: { product_slug: PLAN_JETPACK_SECURITY_REALTIME } },
				jetpackSite.ID
			)
		).toEqual( true );
	} );

	it( 'returns true when on a jetpack complete plan', () => {
		expect(
			hasSiteAnalyticsFeature(
				state,
				{ jetpackSite, plan: { product_slug: PLAN_JETPACK_COMPLETE } },
				jetpackSite.ID
			)
		).toEqual( true );
	} );
} );
