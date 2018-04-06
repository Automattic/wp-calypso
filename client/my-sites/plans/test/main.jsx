/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import isSiteAutomatedTransferSelector from 'state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'state/sites/selectors';
import { getIntervalTypeFromCurrentPlan } from 'state/plans/selectors';

import { mapStateToProps } from '../main';

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'lib/analytics/index', () => ( {} ) );
jest.mock( 'lib/analytics/ad-tracking', () => ( {} ) );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'lib/upgrades/actions', () => ( {} ) );
jest.mock( 'lib/user', () => ( {} ) );
jest.mock( 'components/main', () => 'MainComponent' );
jest.mock( 'components/popover', () => 'Popover' );
jest.mock( 'my-sites/plan-features', () => 'PlanFeatures' );
jest.mock( 'state/ui/selectors', () => ( {
	getSelectedSite: jest.fn(),
	getSelectedSiteId: jest.fn(),
} ) );

jest.mock( 'state/selectors/is-site-automated-transfer', () => jest.fn() );
jest.mock( 'state/plans/selectors', () => ( {
	getIntervalTypeFromCurrentPlan: jest.fn( () => null ),
} ) );
jest.mock( 'state/sites/selectors', () => ( {
	isJetpackSite: jest.fn(),
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
	numberFormat: x => x,
} ) );

const state = {};

describe( 'mapStateToProps', () => {
	beforeEach( () => {
		getSelectedSite.mockImplementation( () => ( { id: 1 } ) );
		getSelectedSiteId.mockImplementation( () => 1 );
	} );

	test( 'should transform state to appropriate props', () => {
		isJetpackSite.mockImplementation( () => false );
		isSiteAutomatedTransferSelector.mockImplementation( () => false );

		const result = mapStateToProps( state, {} );
		expect( Object.keys( result ) ).toEqual( [
			'intervalType',
			'selectedSite',
			'displayJetpackPlans',
		] );
		expect( result.selectedSite ).toEqual( { id: 1 } );
		expect( result.displayJetpackPlans ).toBe( false );
	} );

	test( 'should return proper displayJetpackPlans value (1)', () => {
		isJetpackSite.mockImplementation( () => true );
		isSiteAutomatedTransferSelector.mockImplementation( () => false );

		const result = mapStateToProps( state, {} );
		expect( result.displayJetpackPlans ).toBe( true );
	} );

	test( 'should return proper displayJetpackPlans value (2)', () => {
		isJetpackSite.mockImplementation( () => false );
		isSiteAutomatedTransferSelector.mockImplementation( () => false );

		const result = mapStateToProps( state, {} );
		expect( result.displayJetpackPlans ).toBe( false );
	} );

	test( 'should return proper displayJetpackPlans value (3)', () => {
		isJetpackSite.mockImplementation( () => true );
		isSiteAutomatedTransferSelector.mockImplementation( () => true );

		const result = mapStateToProps( state, {} );
		expect( result.displayJetpackPlans ).toBe( false );
	} );

	test( 'should return proper displayJetpackPlans value (4)', () => {
		isJetpackSite.mockImplementation( () => false );
		isSiteAutomatedTransferSelector.mockImplementation( () => false );

		const result = mapStateToProps( state, {} );
		expect( result.displayJetpackPlans ).toBe( false );
	} );

	test( 'should return intervalType returned by getIntervalTypeFromCurrentPlan', () => {
		getIntervalTypeFromCurrentPlan.mockImplementation( () => '2yearly' );
		expect( mapStateToProps( state, {} ).intervalType ).toBe( '2yearly' );

		getIntervalTypeFromCurrentPlan.mockImplementation( () => 'yearly' );
		expect( mapStateToProps( state, {} ).intervalType ).toBe( 'yearly' );
	} );

	test(
		'should return null intervalType if getIntervalTypeFromCurrentPlan returns monthly - to keep ' +
			'jetpack upgrade page same as before this was introduced',
		() => {
			getIntervalTypeFromCurrentPlan.mockImplementation( () => 'monthly' );
			expect( mapStateToProps( state, {} ).intervalType ).toBe( null );
		}
	);

	test( 'should return intervalType from props if it is passed', () => {
		getIntervalTypeFromCurrentPlan.mockImplementation( () => '2yearly' );
		expect( mapStateToProps( state, { intervalType: 'yearly' } ).intervalType ).toBe( 'yearly' );
	} );
} );
