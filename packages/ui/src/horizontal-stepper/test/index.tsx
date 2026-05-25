import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HorizontalStepper } from '..';

function ThreeSteps( {
	value,
	onValueChange,
	linear = false,
}: {
	value?: string;
	onValueChange?: ( v: string ) => void;
	linear?: boolean;
} ) {
	return (
		<HorizontalStepper
			aria-label="Test stepper"
			value={ value }
			onValueChange={ onValueChange }
			linear={ linear }
		>
			<HorizontalStepper.Step value="a" title="Step A" status="completed">
				Panel A
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="b" title="Step B">
				Panel B
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="c" title="Step C">
				Panel C
			</HorizontalStepper.Step>
		</HorizontalStepper>
	);
}

describe( 'HorizontalStepper', () => {
	it( 'renders step titles', async () => {
		render( <ThreeSteps value="b" /> );
		await waitFor( () => {
			expect( screen.getByText( 'Step A' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Step B' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Step C' ) ).toBeInTheDocument();
		} );
	} );

	it( 'shows the active panel only', async () => {
		render( <ThreeSteps value="b" /> );
		await waitFor( () => {
			expect( screen.getByText( 'Panel B' ) ).toBeInTheDocument();
		} );
		expect( screen.queryByText( 'Panel A' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Panel C' ) ).not.toBeInTheDocument();
	} );

	it( 'marks the current step trigger with aria-current="step"', async () => {
		render( <ThreeSteps value="b" /> );
		await waitFor( () => {
			const trigger = screen.getByRole( 'tab', { name: /Step B/i } );
			expect( trigger ).toHaveAttribute( 'aria-current', 'step' );
		} );
	} );

	it( 'calls onValueChange when a tab is clicked', async () => {
		const user = userEvent.setup();
		const onValueChange = jest.fn();
		render( <ThreeSteps value="b" onValueChange={ onValueChange } /> );
		await waitFor( () => screen.getByRole( 'tab', { name: /Step A/i } ) );
		await user.click( screen.getByRole( 'tab', { name: /Step A/i } ) );
		expect( onValueChange ).toHaveBeenCalledWith( 'a' );
	} );

	it( 'works uncontrolled with defaultValue', async () => {
		render(
			<HorizontalStepper aria-label="Uncontrolled" defaultValue="a">
				<HorizontalStepper.Step value="a" title="A">
					Panel A
				</HorizontalStepper.Step>
				<HorizontalStepper.Step value="b" title="B">
					Panel B
				</HorizontalStepper.Step>
			</HorizontalStepper>
		);
		await waitFor( () => {
			expect( screen.getByText( 'Panel A' ) ).toBeInTheDocument();
		} );
	} );

	it( 'marks a completed step with data-status="completed"', async () => {
		render( <ThreeSteps value="b" /> );
		await waitFor( () => screen.getByRole( 'tab', { name: /Step A/i } ) );
		// The step container (parent of the trigger) carries data-status.
		const trigger = screen.getByRole( 'tab', { name: /Step A/i } );
		const stepContainer = trigger.closest( '[data-status]' );
		expect( stepContainer ).toHaveAttribute( 'data-status', 'completed' );
	} );

	describe( 'linear mode', () => {
		it( 'marks future steps as aria-disabled', async () => {
			render( <ThreeSteps value="a" linear /> );
			await waitFor( () => screen.getByRole( 'tab', { name: /Step C/i } ) );
			const futureTab = screen.getByRole( 'tab', { name: /Step C/i } );
			expect( futureTab ).toHaveAttribute( 'aria-disabled', 'true' );
		} );

		it( 'does not fire onValueChange for a disabled future step', async () => {
			const user = userEvent.setup();
			const onValueChange = jest.fn();
			render( <ThreeSteps value="a" onValueChange={ onValueChange } linear /> );
			await waitFor( () => screen.getByRole( 'tab', { name: /Step C/i } ) );
			await user.click( screen.getByRole( 'tab', { name: /Step C/i } ) );
			expect( onValueChange ).not.toHaveBeenCalled();
		} );
	} );

	it( 'includes accessible step label in indicator', async () => {
		render( <ThreeSteps value="b" /> );
		await waitFor( () => {
			// Screen-reader text like "Step 2 of 3" should be in the document.
			expect( screen.getByText( /Step 2 of 3/i ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders a tablist', async () => {
		render( <ThreeSteps value="b" /> );
		await waitFor( () => {
			expect( screen.getByRole( 'tablist' ) ).toBeInTheDocument();
		} );
	} );
} );
