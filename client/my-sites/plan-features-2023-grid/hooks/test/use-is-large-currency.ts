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
				currencyCode: 'USD',
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
				currencyCode: 'USD',
			},
		},
		{
			planSlug: PLAN_PREMIUM,
			pricing: {
				originalPrice: {
					monthly: 2500,
					full: 3000000,
				},
				discountedPrice: {
					monthly: 0,
					full: 20,
				},
				currencyCode: 'USD',
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
			useIsLargeCurrency( { gridPlans: gridPlans as GridPlan[], returnMonthly: false } )
		).toEqual( true );
	} );

	test( 'should return true for large, when combined, original and discounted values', () => {
		expect(
			useIsLargeCurrency( { gridPlans: gridPlans as GridPlan[], returnMonthly: true } )
		).toEqual( false );
	} );
} );
