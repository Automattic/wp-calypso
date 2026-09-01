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

		await userEvent.click( screen.getByRole( 'tab', { name: /Select a domain/ } ) );
		expect( onStepSelect ).toHaveBeenCalledWith( 'domains' );

		await userEvent.click( screen.getByRole( 'tab', { name: /Select a plan/ } ) );
		expect( onStepSelect ).toHaveBeenCalledWith( 'plans' );
	} );

	it( 'leaves the plans step out when the plan was chosen before the flow', () => {
		render( <OnboardingProgress currentStep="domains" hidePlansStep /> );

		expect( screen.queryByRole( 'tab', { name: /Select a plan/ } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'tab', { name: /Complete payment/ } ) ).toBeVisible();
	} );

	it( 'does not call onStepSelect for the current step', async () => {
		const onStepSelect = jest.fn();
		render( <OnboardingProgress currentStep="checkout" onStepSelect={ onStepSelect } /> );

		await userEvent.click( screen.getByRole( 'tab', { name: /Complete payment/ } ) );
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

		const domainsStep = screen.getByRole( 'tab', { name: /Select a domain/ } );
		expect( domainsStep ).toHaveAttribute( 'aria-disabled', 'true' );

		await userEvent.click( domainsStep );
		await userEvent.click( screen.getByRole( 'tab', { name: /Select a plan/ } ) );
		expect( onStepSelect ).not.toHaveBeenCalled();
	} );
} );
