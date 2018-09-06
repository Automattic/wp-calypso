/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'lib/analytics/index', () => ( {} ) );
jest.mock( 'lib/analytics/ad-tracking', () => ( {} ) );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'components/main', () => 'MainComponent' );
jest.mock( 'components/popover', () => 'Popover' );
jest.mock( 'components/info-popover', () => 'InfoPopover' );

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
	translate: x => x,
} ) );

/**
 * External dependencies
 */
import React from 'react';
import {
	PLAN_FREE,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { isPrimaryUpgradeByPlanDelta } from '../index';

describe( 'isPrimaryUpgradeByPlanDelta', () => {
	test( 'Should return true when called with blogger and personal plan', () => {
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER, PLAN_PERSONAL ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER, PLAN_PERSONAL_2_YEARS ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS ) ).toBe(
			true
		);
	} );

	test( 'Should return true when called with personal and premium plan', () => {
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PERSONAL, PLAN_PREMIUM ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PERSONAL, PLAN_PREMIUM_2_YEARS ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ) ).toBe(
			true
		);
	} );

	test( 'Should return true when called with premium and business plan', () => {
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM, PLAN_BUSINESS ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM, PLAN_BUSINESS_2_YEARS ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM_2_YEARS, PLAN_BUSINESS ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM_2_YEARS, PLAN_BUSINESS_2_YEARS ) ).toBe(
			true
		);
	} );

	test( 'Should return false when called with other plan combinations', () => {
		expect( isPrimaryUpgradeByPlanDelta( PLAN_JETPACK_FREE, PLAN_JETPACK_PREMIUM ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_JETPACK_FREE, PLAN_JETPACK_BUSINESS ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PREMIUM ) ).toBe(
			false
		);
		expect(
			isPrimaryUpgradeByPlanDelta( PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PREMIUM_MONTHLY )
		).toBe( false );
		expect(
			isPrimaryUpgradeByPlanDelta( PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_PREMIUM_MONTHLY )
		).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM, PLAN_PREMIUM ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM, PLAN_PREMIUM_2_YEARS ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM_2_YEARS, PLAN_PERSONAL ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER, PLAN_BLOGGER ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER, PLAN_BLOGGER_2_YEARS ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER_2_YEARS, PLAN_PREMIUM ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BUSINESS, PLAN_PREMIUM ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BUSINESS, PLAN_BLOGGER ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BUSINESS, PLAN_PERSONAL ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BUSINESS, PLAN_FREE ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_FREE, PLAN_PREMIUM ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_FREE, PLAN_BLOGGER ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_FREE, PLAN_PERSONAL ) ).toBe( false );
	} );
} );
