/**
 * @format
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import { mount, render } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import PlansWrapper, { getSitePlans, SELECTED_SITE, SITE_PLAN_PRO } from './lib/plans';
import { PLAN_JETPACK_BUSINESS } from 'lib/plans/constants';

jest.mock( 'components/data/query-plans', () => require( 'components/empty-component' ) );
jest.mock( 'components/data/query-site-plans', () => require( 'components/empty-component' ) );
jest.mock( 'jetpack-connect/happychat-button', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/plan-features', () => require( 'components/empty-component' ) );

describe( 'Plans', () => {
	test( 'should render with no plan (free)', () => {
		const wrapper = render( <PlansWrapper /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should render with a paid plan', () => {
		const wrapper = render(
			<PlansWrapper
				selectedSite={ { ...SELECTED_SITE, plan: SITE_PLAN_PRO } }
				sitePlans={ getSitePlans( PLAN_JETPACK_BUSINESS ) }
			/>
		);

		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should redirect if Atomic', () => {
		const goBackToWpAdmin = jest.fn();

		const atomicPlans = (
			<PlansWrapper
				goBackToWpAdmin={ goBackToWpAdmin }
				isAutomatedTransfer={ true }
				selectedSite={ {
					...SELECTED_SITE,
					plan: SITE_PLAN_PRO,
					is_automated_transfer: true,
				} }
				sitePlans={ getSitePlans( PLAN_JETPACK_BUSINESS ) }
			/>
		);

		const wrapper = render( atomicPlans );

		expect( wrapper ).toMatchSnapshot();

		mount( atomicPlans );

		expect( goBackToWpAdmin.mock.calls.length ).toBe( 1 );
	} );
} );
