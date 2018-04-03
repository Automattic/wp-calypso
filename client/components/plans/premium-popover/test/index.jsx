/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'lib/analytics/index', () => ( {} ) );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'lib/user', () => ( {} ) );
jest.mock( 'components/main', () => 'MainComponent' );
jest.mock( 'components/popover', () => 'Popover' );

jest.mock( 'i18n-calypso', () => ( {
	localize: Comp => props => (
		<Comp
			{ ...props }
			translate={ function( x ) {
				return x;
			} }
		/>
	),
	numberFormat: x => x,
} ) );

/**
 * External dependencies
 */
import React from 'react';
import {
	PLANS_LIST,
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { mapStateToProps } from '../index';

describe( 'mapStateToProps()', () => {
	const allPlans = ( function() {
		const plans = {};
		for ( const slug in PLANS_LIST ) {
			plans[ slug ] = {
				product_slug: slug,
			};
		}
		return plans;
	} )();

	const getState = plan => ( {
		ui: {
			selectedSiteId: 1,
		},
		plans: {
			items: allPlans,
		},
		sites: {
			plans: allPlans,
			items: {
				1: {
					plan: {
						product_slug: plan,
					},
				},
			},
		},
	} );

	[ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS ].forEach( plan => {
		test( 'Should return 1-year premium plan for other 1 year plans', () => {
			expect( mapStateToProps( getState( plan ) ).premiumPlan.product_slug ).toBe( PLAN_PREMIUM );
		} );
	} );

	[ PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS, PLAN_BUSINESS_2_YEARS ].forEach( plan => {
		test( 'Should return 2-year premium plan for other 1 year plans', () => {
			expect( mapStateToProps( getState( plan ) ).premiumPlan.product_slug ).toBe(
				PLAN_PREMIUM_2_YEARS
			);
		} );
	} );
} );
