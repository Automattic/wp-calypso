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

	// The peek treatment hides non-current labels with opacity, never with
	// `display: none`, so every step keeps a full accessible name even while
	// only one label is painted. This is the test that would fail if someone
	// "optimised" the hidden labels out of the DOM.
	it( 'keeps every step label in the accessible name, including the hidden ones', () => {
		render( <OnboardingProgress currentStep="plans" /> );

		expect( screen.getByRole( 'tab', { name: /Domain/ } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'tab', { name: /Plan/ } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'tab', { name: /Payment/ } ) ).toBeInTheDocument();
	} );
} );
