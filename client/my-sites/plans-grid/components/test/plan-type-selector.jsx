/** @jest-environment jsdom */
import { PLAN_FREE } from '@automattic/calypso-products';
import { screen, render } from '@testing-library/react';
import PlanTypeSelector from '../plan-type-selector';

describe( '<PlanTypeSelector />', () => {
	const myProps = {
		selectedPlan: PLAN_FREE,
		hideFreePlan: true,
		withWPPlanTabs: true,
		displayedIntervals: [ 'monthly', 'yearly' ],
		usePricingMetaForGridPlans: () => null,
	};

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
