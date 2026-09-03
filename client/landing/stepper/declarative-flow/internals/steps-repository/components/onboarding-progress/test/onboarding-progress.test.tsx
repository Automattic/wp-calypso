/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingProgress } from '..';

describe( 'OnboardingProgress', () => {
	it( 'calls onStepSelect with the clicked previous step on checkout', async () => {
		const onStepSelect = jest.fn();
		render( <OnboardingProgress currentStep="checkout" onStepSelect={ onStepSelect } /> );

		await userEvent.click( screen.getByRole( 'tab', { name: /Domain/ } ) );
		expect( onStepSelect ).toHaveBeenCalledWith( 'domains' );

		await userEvent.click( screen.getByRole( 'tab', { name: /Plan/ } ) );
		expect( onStepSelect ).toHaveBeenCalledWith( 'plans' );
	} );

	it( 'does not call onStepSelect for the current step', async () => {
		const onStepSelect = jest.fn();
		render( <OnboardingProgress currentStep="checkout" onStepSelect={ onStepSelect } /> );

		await userEvent.click( screen.getByRole( 'tab', { name: /Payment/ } ) );
		expect( onStepSelect ).not.toHaveBeenCalled();
	} );

	it( 'ignores clicks on the previous steps while step selection is disabled', async () => {
		const onStepSelect = jest.fn();
		render(
			<OnboardingProgress
				currentStep="checkout"
				onStepSelect={ onStepSelect }
				isStepSelectDisabled
			/>
		);

		const domainsStep = screen.getByRole( 'tab', { name: /Domain/ } );
		expect( domainsStep ).toHaveAttribute( 'aria-disabled', 'true' );

		await userEvent.click( domainsStep );
		await userEvent.click( screen.getByRole( 'tab', { name: /Plan/ } ) );
		expect( onStepSelect ).not.toHaveBeenCalled();
	} );

	// The text rail draws no dots, but Stepper.Indicator is still rendered
	// because it supplies the position and status text. It is clipped in CSS,
	// not removed. This test fails if anyone deletes it from the tree.
	it( 'keeps step position and status in each accessible name', () => {
		render( <OnboardingProgress currentStep="plans" /> );

		expect( screen.getByRole( 'tab', { name: 'Step 1 of 3, completed Domain' } ) ).toBeVisible();
		expect( screen.getByRole( 'tab', { name: 'Step 2 of 3 Plan' } ) ).toBeVisible();
		expect( screen.getByRole( 'tab', { name: 'Step 3 of 3 Payment' } ) ).toBeVisible();
	} );
} );
