/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import {
	PLAN_FREE,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from '@automattic/calypso-products';
import { mapStateToProps } from '../main';
import { getUserPurchases } from 'calypso/state/purchases/selectors';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/user', () => jest.fn() );
jest.mock( '../help-unverified-warning', () => 'HelpUnverifiedWarning' );
jest.mock( 'calypso/components/main', () => 'Main' );
jest.mock( 'calypso/components/section-header', () => 'SectionHeader' );
jest.mock( 'calypso/me/sidebar-navigation', () => 'MeSidebarNavigation' );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserId: jest.fn( () => 12 ),
	isCurrentUserEmailVerified: jest.fn( () => true ),
} ) );

jest.mock( 'calypso/state/purchases/selectors', () => ( {
	getUserPurchases: jest.fn(),
	isFetchingUserPurchases: jest.fn( () => false ),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	localize: ( Comp ) => ( props ) => (
		<Comp
			{ ...props }
			translate={ function ( x ) {
				return x;
			} }
		/>
	),
	translate: ( x ) => x,
	numberFormat: ( x ) => x,
} ) );

describe( 'mapStateToProps should return correct value for isBusinessPlanUser', () => {
	[
		PLAN_FREE,
		PLAN_BLOGGER,
		PLAN_BLOGGER_2_YEARS,
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
	].forEach( ( productSlug ) => {
		test( `False for plan ${ JSON.stringify( productSlug ) }`, () => {
			getUserPurchases.mockImplementation( () => [ { productSlug } ] );
			expect( mapStateToProps( {}, {} ).isBusinessPlanUser ).toBe( false );
		} );
	} );

	[
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_2_YEARS,
	].forEach( ( productSlug ) => {
		test( `True for plan ${ JSON.stringify( productSlug ) }`, () => {
			getUserPurchases.mockImplementation( () => [ { productSlug } ] );
			expect( mapStateToProps( {}, {} ).isBusinessPlanUser ).toBe( true );
		} );
	} );

	test( 'Should be false for purchases not loaded', () => {
		getUserPurchases.mockImplementation( () => null );
		expect( mapStateToProps( {}, {} ).isBusinessPlanUser ).toBe( false );
	} );

	test( 'Should be false for no purchases', () => {
		getUserPurchases.mockImplementation( () => [] );
		expect( mapStateToProps( {}, {} ).isBusinessPlanUser ).toBe( false );
	} );
} );
