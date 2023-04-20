/** @jest-environment jsdom */
jest.mock( 'i18n-calypso', () => ( {
	localize: ( Component ) => ( props ) => <Component { ...props } translate={ ( x ) => x } />,
	numberFormat: ( x ) => x,
	translate: ( x ) => x,
	useTranslate: jest.fn( () => ( x ) => x ),
} ) );
jest.mock( '@automattic/components', () => ( {
	Popover: () => <div />,
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	...jest.requireActual( 'calypso/state/ui/selectors' ),
	getSelectedSiteId: jest.fn( () => null ),
} ) );

import { PLAN_FREE } from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PlanTypeSelector, { CustomerTypeToggle } from '../plan-type-selector';

const render = ( el, options ) => renderWithProvider( el, { ...options } );

describe( '<PlanTypeSelector />', () => {
	const myProps = {
		selectedPlan: PLAN_FREE,
		hideFreePlan: true,
		withWPPlanTabs: true,
	};

	test( 'Should show CustomerTypeToggle when kind is set to `customer`', () => {
		render( <PlanTypeSelector { ...myProps } kind="customer" customerType="personal" /> );

		expect( screen.getByRole( 'radiogroup' ) ).toHaveClass( 'is-customer-type-toggle' );

		const radios = screen.queryAllByRole( 'radio' );

		expect( radios[ 0 ] ).toHaveTextContent( 'Blogs and personal sites' );
		expect( radios[ 1 ] ).toHaveTextContent( 'Business sites and online stores' );

		expect( radios[ 0 ] ).toBeChecked();
	} );

	test( 'Should show IntervalTypeToggle when kind is set to `interval`', () => {
		render(
			<PlanTypeSelector
				{ ...myProps }
				kind="interval"
				intervalType="monthly"
				eligibleForWpcomMonthlyPlans
			/>
		);

		expect( screen.getByRole( 'radiogroup' ) ).toHaveClass( 'price-toggle' );

		const radios = screen.queryAllByRole( 'radio' );

		expect( radios[ 0 ] ).toHaveTextContent( 'Pay monthly' );
		expect( radios[ 1 ] ).toHaveTextContent( 'Pay annually' );

		expect( radios[ 0 ] ).toBeChecked();
	} );
} );

describe( '<CustomerTypeToggle />', () => {
	const myProps = {
		selectedPlan: PLAN_FREE,
		hideFreePlan: true,
		withWPPlanTabs: true,
	};

	afterEach( () => {} );

	test( "Should select personal tab when it's requested", () => {
		const props = { ...myProps, customerType: 'personal' };
		render( <CustomerTypeToggle { ...props } /> );

		const radios = screen.getAllByRole( 'radio' );

		expect( radios ).toHaveLength( 2 );

		expect( radios[ 0 ] ).toHaveAttribute( 'href', '?customerType=personal&plan=free_plan' );
		expect( radios[ 0 ] ).toHaveAttribute( 'aria-checked', 'true' );

		expect( radios[ 1 ] ).toHaveAttribute( 'href', '?customerType=business&plan=free_plan' );
		expect( radios[ 1 ] ).toHaveAttribute( 'aria-checked', 'false' );
	} );

	test( "Should select business tab when it's requested", () => {
		const props = { ...myProps, customerType: 'business' };
		render( <CustomerTypeToggle { ...props } /> );

		const radios = screen.getAllByRole( 'radio' );

		expect( radios[ 0 ] ).toHaveAttribute( 'href', '?customerType=personal&plan=free_plan' );
		expect( radios[ 0 ] ).toHaveAttribute( 'aria-checked', 'false' );

		expect( radios[ 1 ] ).toHaveAttribute( 'href', '?customerType=business&plan=free_plan' );
		expect( radios[ 1 ] ).toHaveAttribute( 'aria-checked', 'true' );
	} );

	test( 'Should generate tabs links based on the current search parameters', () => {
		history.replaceState( {}, '', '?fake=1' );

		const props = { ...myProps, customerType: 'business' };
		render( <CustomerTypeToggle { ...props } /> );

		const radios = screen.getAllByRole( 'radio' );

		expect( radios[ 0 ] ).toHaveAttribute( 'href', '?fake=1&customerType=personal&plan=free_plan' );
		expect( radios[ 1 ] ).toHaveAttribute( 'href', '?fake=1&customerType=business&plan=free_plan' );

		history.replaceState( {}, '', location.pathname );
	} );
} );
