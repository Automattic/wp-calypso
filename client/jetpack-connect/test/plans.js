/**
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
import QueryPlans from 'calypso/components/data/query-plans';
import { DEFAULT_PROPS, SELECTED_SITE, SITE_PLAN_PRO } from './lib/plans';
import { PlansTestComponent as Plans } from '../plans';
import * as path from 'calypso/lib/route/path';

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

	test( 'should redirect if Atomic', () => {
		shallow(
			<Plans
				{ ...DEFAULT_PROPS }
				hasPlan={ true }
				isAutomatedTransfer={ true }
				selectedSite={ {
					...SELECTED_SITE,
					plan: SITE_PLAN_PRO,
					is_automated_transfer: true,
				} }
			/>
		);

		expect( path.externalRedirect ).toHaveBeenCalledTimes( 1 );
	} );
} );
