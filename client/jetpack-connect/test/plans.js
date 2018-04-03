/**
 * @format
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import PlansGrid from '../plans-grid';
import QueryPlans from 'components/data/query-plans';
import { DEFAULT_PROPS, SELECTED_SITE, SITE_PLAN_PRO } from './lib/plans';
import { PLAN_PREMIUM, PLAN_JETPACK_PREMIUM, PLAN_JETPACK_FREE } from 'lib/plans/constants';
import { PlansTestComponent as Plans } from '../plans';
import * as path from 'lib/route/path';

jest.mock( 'lib/analytics', () => ( {
	mc: {
		bumpStat: () => {},
	},
} ) );
jest.mock( 'lib/cart/store', () => ( {} ) );
jest.mock( 'lib/route/path', () => ( {
	externalRedirect: jest.fn(),
} ) );

describe( 'Plans', () => {
	beforeEach( () => {
		path.externalRedirect.mockReset();
	} );
	test( 'should render plans', () => {
		const wrapper = shallow( <Plans { ...DEFAULT_PROPS } /> );

		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.find( PlansGrid ) ).toHaveLength( 1 );
		expect( wrapper.find( QueryPlans ) ).toHaveLength( 1 );
	} );

	test( 'should render placeholder when shouldShowPlaceholder is true', () => {
		const wrapper = shallow( <Plans { ...DEFAULT_PROPS } /> );
		wrapper.instance().shouldShowPlaceholder = jest.fn( () => true );

		// Force rerender with our mocked method
		wrapper.setProps( DEFAULT_PROPS );

		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.find( PlansGrid ) ).toHaveLength( 0 );
		expect( wrapper.find( QueryPlans ) ).toHaveLength( 1 );
	} );

	describe( 'shouldRenderPlaceholder', () => {
		test( 'should return true with unknown plan', () => {
			const wrapper = shallow( <Plans { ...DEFAULT_PROPS } hasPlan={ null } /> );

			expect( wrapper.instance().shouldShowPlaceholder() ).toBe( true );
		} );

		test( 'should return true if isAutomatedTransfer is null', () => {
			const wrapper = shallow( <Plans { ...DEFAULT_PROPS } isAutomatedTransfer={ null } /> );

			expect( wrapper.instance().shouldShowPlaceholder() ).toBe( true );
		} );

		test( 'should return true with a paid plan', () => {
			const wrapper = shallow(
				<Plans
					{ ...DEFAULT_PROPS }
					hasPlan={ true }
					selectedSite={ { ...SELECTED_SITE, plan: SITE_PLAN_PRO } }
				/>
			);

			expect( wrapper.instance().shouldShowPlaceholder() ).toBe( true );
		} );
	} );

	test( 'should redirect when hasPlan is loaded', () => {
		const wrapper = shallow(
			<Plans { ...DEFAULT_PROPS } hasPlan={ null } selectedSite={ null } />
		);

		const redirect = ( wrapper.instance().redirect = jest.fn() );

		wrapper.setProps( {
			hasPlan: true,
			selectedSite: { ...SELECTED_SITE, plan: SITE_PLAN_PRO },
		} );

		expect( redirect ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should redirect if notJetpack', () => {
		const wrapper = shallow(
			<Plans { ...DEFAULT_PROPS } hasPlan={ null } selectedSite={ null } notJetpack={ null } />
		);

		const redirect = ( wrapper.instance().redirect = jest.fn() );

		wrapper.setProps( {
			notJetpack: true,
			selectedSite: { ...SELECTED_SITE, plan: SITE_PLAN_PRO },
		} );

		expect( redirect ).toHaveBeenCalledTimes( 1 );
	} );

	const defProps = {
		recordTracksEvent: x => x,
		completeFlow: x => x,
	};

	test( 'selectPlan should call selectFreeJetpackPlan when cartItem is null', () => {
		const plans = new Plans( defProps );
		plans.redirect = jest.fn();
		plans.selectFreeJetpackPlan = jest.fn();
		plans.selectPlan( null );
		expect( plans.selectFreeJetpackPlan ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'selectPlan should call selectFreeJetpackPlan when cartItem is jetpack free plan', () => {
		const plans = new Plans( defProps );
		plans.redirect = jest.fn();
		plans.selectFreeJetpackPlan = jest.fn();
		plans.selectPlan( { product_slug: PLAN_JETPACK_FREE } );
		expect( plans.selectFreeJetpackPlan ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'selectPlan should not call selectFreeJetpackPlan when cartItem is not jetpack free plan (premium jetpack)', () => {
		const plans = new Plans( defProps );
		plans.redirect = jest.fn();
		plans.selectFreeJetpackPlan = jest.fn();
		plans.selectPlan( { product_slug: PLAN_JETPACK_PREMIUM } );
		expect( plans.selectFreeJetpackPlan ).toHaveBeenCalledTimes( 0 );
	} );

	test( 'selectPlan should not call selectFreeJetpackPlan when cartItem is not jetpack free plan (premium wpcom)', () => {
		const plans = new Plans( defProps );
		plans.redirect = jest.fn();
		plans.selectFreeJetpackPlan = jest.fn();
		plans.selectPlan( { product_slug: PLAN_PREMIUM } );
		expect( plans.selectFreeJetpackPlan ).toHaveBeenCalledTimes( 0 );
	} );
} );
