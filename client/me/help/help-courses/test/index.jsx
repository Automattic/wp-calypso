/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { mapStateToProps } from '../index';
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
} from 'lib/plans/constants';

jest.mock( 'lib/analytics/page-view', () => ( {} ) );
jest.mock( 'lib/user', () => () => {} );
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
	hasLoadedUserPurchasesFromServer: jest.fn( () => true ),
} ) );

jest.mock( 'state/help/courses/selectors', () => ( {
	getHelpCourses: jest.fn( () => [] ),
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

import purchasesSelectors from 'state/purchases/selectors';

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
	].forEach( ( productSlug ) => {
		test( `False for plan ${ productSlug }`, () => {
			purchasesSelectors.getUserPurchases.mockImplementation( () => [ { productSlug } ] );
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
		test( `True for plan ${ productSlug }`, () => {
			purchasesSelectors.getUserPurchases.mockImplementation( () => [ { productSlug } ] );
			expect( mapStateToProps( {}, {} ).isBusinessPlanUser ).toBe( true );
		} );
	} );
} );
