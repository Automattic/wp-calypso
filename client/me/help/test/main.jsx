/** @format */

/**
 * External dependencies
 */
import React from 'react';
import {
	PLAN_FREE,
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
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { mapStateToProps } from '../main';

jest.mock( 'lib/analytics', () => ( {} ) );
jest.mock( 'lib/user', () => ( {} ) );
jest.mock( '../help-unverified-warning', () => 'HelpUnverifiedWarning' );
jest.mock( 'components/card/compact', () => 'CardCompact' );
jest.mock( 'components/button', () => 'Button' );
jest.mock( 'components/main', () => 'Main' );
jest.mock( 'components/section-header', () => 'SectionHeader' );
jest.mock( 'me/sidebar-navigation', () => 'MeSidebarNavigation' );
jest.mock( 'state/current-user/selectors', () => ( {
	getCurrentUserId: jest.fn( () => 12 ),
	isCurrentUserEmailVerified: jest.fn( () => true ),
} ) );

jest.mock( 'state/purchases/selectors', () => ( {
	getUserPurchases: jest.fn(),
	isFetchingUserPurchases: jest.fn( () => false ),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	localize: Comp => props => (
		<Comp
			{ ...props }
			translate={ function( x ) {
				return x;
			} }
		/>
	),
	translate: x => x,
	numberFormat: x => x,
} ) );

import purchasesSelectors from 'state/purchases/selectors';

describe( 'mapStateToProps should return correct value for isBusinessPlanUser', () => {
	[
		PLAN_FREE,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		undefined,
	].forEach( productSlug => {
		test( `False for plan ${ JSON.stringify( productSlug ) }`, () => {
			purchasesSelectors.getUserPurchases.mockImplementation( () => [ { productSlug } ] );
			expect( mapStateToProps( {}, {} ).isBusinessPlanUser ).toBe( false );
		} );
	} );

	[ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ].forEach( productSlug => {
		test( `True for plan ${ JSON.stringify( productSlug ) }`, () => {
			purchasesSelectors.getUserPurchases.mockImplementation( () => [ { productSlug } ] );
			expect( mapStateToProps( {}, {} ).isBusinessPlanUser ).toBe( true );
		} );
	} );

	test( 'Should be false for purchases not loaded', () => {
		purchasesSelectors.getUserPurchases.mockImplementation( () => null );
		expect( mapStateToProps( {}, {} ).isBusinessPlanUser ).toBe( false );
	} );

	test( 'Should be false for no purchases', () => {
		purchasesSelectors.getUserPurchases.mockImplementation( () => [] );
		expect( mapStateToProps( {}, {} ).isBusinessPlanUser ).toBe( false );
	} );
} );
