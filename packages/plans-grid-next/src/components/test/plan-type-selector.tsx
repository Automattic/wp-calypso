/** @jest-environment jsdom */

/**
 * Default mock implementations
 */
jest.mock( '@automattic/data-stores', () => ( {
	Plans: {
		usePricingMetaForGridPlans: jest.fn(),
	},
} ) );

import { PLAN_FREE } from '@automattic/calypso-products';
import { screen, render } from '@testing-library/react';
import React from 'react';
import PlanTypeSelector from '../plan-type-selector';

describe( '<PlanTypeSelector />', () => {
	test( 'Should show IntervalTypeToggle when kind is set to `interval`', () => {
		render(
			<PlanTypeSelector
				customerType="personal"
				displayedIntervals={ [ 'monthly', 'yearly' ] }
				eligibleForWpcomMonthlyPlans
				intervalType="monthly"
				isInSignup
				isPlansInsideStepper={ false }
				isStepperUpgradeFlow={ false }
				kind="interval"
				plans={ [] }
				selectedPlan={ PLAN_FREE }
				useCheckPlanAvailabilityForPurchase={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'radiogroup' ) ).toHaveClass( 'price-toggle' );

		const radios = screen.queryAllByRole( 'radio' );

		expect( radios[ 0 ] ).toHaveTextContent( 'Pay monthly' );
		expect( radios[ 1 ] ).toHaveTextContent( 'Pay annually' );

		expect( radios[ 0 ] ).toBeChecked();
	} );
} );
