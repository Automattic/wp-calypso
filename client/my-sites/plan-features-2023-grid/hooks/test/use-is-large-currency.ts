/**
 * @jest-environment jsdom
 */

import { PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import useIsLargeCurrency from '../npm-ready/use-is-large-currency';
import type { GridPlan } from '../npm-ready/data-store/use-grid-plans';

describe( 'useIsLargeCurrency', () => {
	const gridPlans = [
		{
			planSlug: PLAN_FREE,
			pricing: {
				originalPrice: {
					monthly: 0,
					full: 0,
				},
				discountedPrice: {
					monthly: 0,
					full: 0,
				},
			},
		},
		{
			planSlug: PLAN_PERSONAL,
			pricing: {
				originalPrice: {
					monthly: 100,
					full: 100000,
				},
				discountedPrice: {
					monthly: 0,
					full: 0,
				},
			},
		},
		{
			planSlug: PLAN_PREMIUM,
			pricing: {
				originalPrice: {
					monthly: 300,
					full: 300000,
				},
				discountedPrice: {
					monthly: 0,
					full: 0,
				},
			},
		},
	];

	test( 'should return false for small values', () => {
		expect(
			useIsLargeCurrency( { gridPlans: gridPlans as GridPlan[], returnMonthly: true } )
		).toEqual( false );
	} );

	test( 'should return true for large values', () => {
		expect(
			useIsLargeCurrency( { gridPlans: gridPlans as GridPlan[], returnMonthly: felse } )
		).toEqual( true );
	} );
} );
