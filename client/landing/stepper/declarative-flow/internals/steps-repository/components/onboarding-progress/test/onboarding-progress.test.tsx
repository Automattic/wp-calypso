/**
 * @jest-environment jsdom
 */
import { Step } from '@automattic/onboarding';
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

	it( 'leaves the plans step out when the plan was chosen before the flow', () => {
		render( <OnboardingProgress currentStep="domains" shouldHidePlansStep /> );

		expect( screen.queryByRole( 'tab', { name: /Plan/ } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'tab', { name: /Step 2 of 2.*Payment/ } ) ).toBeVisible();
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

	// The rail and the counter are the same indicator at two widths, so they have
	// to be the same type. Both go through @wordpress/ui `Text` at `body-md`
	// rather than restating 13px / 20px / 400 in two stylesheets. This asserts
	// they still land on the same variant, so the two cannot drift apart if the
	// token moves or someone restyles one of them.
	it( 'sets the step names in the same type as the counter', () => {
		const rail = render( <OnboardingProgress currentStep="plans" /> );
		const railClasses = new Set(
			rail.container.querySelector( '.onboarding-progress-title' )?.className.split( /\s+/ )
		);
		rail.unmount();

		render( <Step.StepCounter current={ 2 } total={ 3 } /> );
		const counterClasses = screen.getByLabelText( 'Step 2 of 3' ).className.split( /\s+/ );

		const shared = counterClasses.filter( ( c ) => railClasses.has( c ) );
		expect( shared.some( ( c ) => c.endsWith( '__body-md' ) ) ).toBe( true );
		expect( shared.some( ( c ) => c.endsWith( '__text' ) ) ).toBe( true );
	} );

	// The rail sits in the top bar's right slot now, between the back button and
	// the help link. Tab order follows the DOM, and the DOM is logo, left slot,
	// right slot, so this asserts the keyboard walks the bar left to right the
	// way it reads. It is one stop, not three: the rail is a tab list, so it
	// takes a single tab and the arrows move within it.
	describe( 'in the top bar', () => {
		const renderTopBar = () =>
			render(
				<Step.TopBar
					leftElement={ <Step.BackButton onClick={ () => {} }>Back</Step.BackButton> }
					rightElement={
						<>
							<OnboardingProgress currentStep="domains" />
							<Step.LinkButton onClick={ () => {} }>Need help?</Step.LinkButton>
						</>
					}
				/>
			);

		it( 'takes one tab stop, in visual order', async () => {
			renderTopBar();

			await userEvent.tab();
			expect( screen.getByRole( 'button', { name: 'Back' } ) ).toHaveFocus();

			await userEvent.tab();
			expect( screen.getByRole( 'tab', { name: /Domain/ } ) ).toHaveFocus();

			// Straight past the other two steps, not into them.
			await userEvent.tab();
			expect( screen.getByRole( 'button', { name: 'Need help?' } ) ).toHaveFocus();
		} );

		it( 'moves between steps with the arrow keys', async () => {
			renderTopBar();

			( screen.getByRole( 'tab', { name: /Domain/ } ) as HTMLElement ).focus();

			await userEvent.keyboard( '{ArrowRight}' );
			expect( screen.getByRole( 'tab', { name: /Plan/ } ) ).toHaveFocus();

			await userEvent.keyboard( '{End}' );
			expect( screen.getByRole( 'tab', { name: /Payment/ } ) ).toHaveFocus();

			await userEvent.keyboard( '{Home}' );
			expect( screen.getByRole( 'tab', { name: /Domain/ } ) ).toHaveFocus();
		} );
	} );
} );
