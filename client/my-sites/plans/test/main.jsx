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
import { getPlan } from 'lib/plans';
import { TERM_MONTHLY, TERM_ANNUALLY, TERM_BIENNIALLY } from 'lib/plans/constants';

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
jest.mock( 'state/sites/selectors', () => ( {
	isJetpackSite: jest.fn(),
	getSitePlan: jest.fn( () => ( {} ) ),
} ) );
jest.mock( 'lib/plans', () => ( {
	getPlan: jest.fn( () => ( {} ) ),
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

	test( 'should return 2-year intervalType if current plan is a 2-year plan', () => {
		getPlan.mockImplementation( () => ( {
			term: TERM_BIENNIALLY,
		} ) );
		const result = mapStateToProps( state, {} );
		expect( result.intervalType ).toBe( '2yearly' );
	} );
	test( 'should return 1-year intervalType if current plan is a 1-year plan', () => {
		getPlan.mockImplementation( () => ( {
			term: TERM_ANNUALLY,
		} ) );
		const result = mapStateToProps( state, {} );
		expect( result.intervalType ).toBe( 'yearly' );
	} );
	test( 'should return monthly intervalType if current plan is a monthly plan', () => {
		getPlan.mockImplementation( () => ( {
			term: TERM_MONTHLY,
		} ) );
		const result = mapStateToProps( state, {} );
		expect( result.intervalType ).toBe( 'monthly' );
	} );
	test( 'should return intervalType from props if it is passed', () => {
		getPlan.mockImplementation( () => ( {
			term: TERM_MONTHLY,
		} ) );
		const result = mapStateToProps( state, { intervalType: 'yearly' } );
		expect( result.intervalType ).toBe( 'yearly' );
	} );
} );
