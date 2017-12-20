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
import { PlansTestComponent as Plans } from '../plans';

describe( 'Plans', () => {
	test( 'should render with no plan (free)', () => {
		const wrapper = shallow( <Plans { ...DEFAULT_PROPS } /> );

		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.find( PlansGrid ) ).toHaveLength( 1 );
		expect( wrapper.find( QueryPlans ) ).toHaveLength( 1 );
	} );

	test( 'should render placeholder with unknown plan', () => {
		const wrapper = shallow( <Plans { ...DEFAULT_PROPS } hasPlan={ null } /> );

		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.find( PlansGrid ) ).toHaveLength( 0 );
		expect( wrapper.find( QueryPlans ) ).toHaveLength( 1 );
	} );

	test( 'should render placeholder with unknown Atomic', () => {
		const wrapper = shallow( <Plans { ...DEFAULT_PROPS } isAutomatedTransfer={ null } /> );

		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.find( PlansGrid ) ).toHaveLength( 0 );
		expect( wrapper.find( QueryPlans ) ).toHaveLength( 1 );
	} );

	test( 'should render placeholder with a paid plan', () => {
		const wrapper = shallow(
			<Plans
				{ ...DEFAULT_PROPS }
				hasPlan={ true }
				selectedSite={ { ...SELECTED_SITE, plan: SITE_PLAN_PRO } }
			/>
		);

		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.find( PlansGrid ) ).toHaveLength( 0 );
		expect( wrapper.find( QueryPlans ) ).toHaveLength( 1 );
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

		expect( redirect.mock.calls ).toHaveLength( 1 );
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

		expect( redirect.mock.calls ).toHaveLength( 1 );
	} );

	test( 'should redirect if Atomic', () => {
		const goBackToWpAdmin = jest.fn();

		shallow(
			<Plans
				{ ...DEFAULT_PROPS }
				goBackToWpAdmin={ goBackToWpAdmin }
				hasPlan={ true }
				isAutomatedTransfer={ true }
				selectedSite={ {
					...SELECTED_SITE,
					plan: SITE_PLAN_PRO,
					is_automated_transfer: true,
				} }
			/>
		);

		expect( goBackToWpAdmin.mock.calls ).toHaveLength( 1 );
	} );
} );
