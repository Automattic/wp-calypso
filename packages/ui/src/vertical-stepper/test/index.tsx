import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VerticalStepper } from '..';

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
		<VerticalStepper
			aria-label="Test stepper"
			value={ value }
			onValueChange={ onValueChange }
			linear={ linear }
		>
			<VerticalStepper.Step value="a" title="Step A" status="completed">
				Panel A
			</VerticalStepper.Step>
			<VerticalStepper.Step value="b" title="Step B">
				Panel B
			</VerticalStepper.Step>
			<VerticalStepper.Step value="c" title="Step C">
				Panel C
			</VerticalStepper.Step>
		</VerticalStepper>
	);
}

describe( 'VerticalStepper', () => {
	it( 'renders step titles', async () => {
		render( <ThreeSteps value="b" /> );
		await waitFor( () => {
			expect( screen.getByText( 'Step A' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Step B' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Step C' ) ).toBeInTheDocument();
		} );
	} );

	it( 'marks the active trigger with aria-current="step"', async () => {
		render( <ThreeSteps value="b" /> );
		await waitFor( () => {
			const trigger = screen.getByRole( 'button', { name: /Step B/i } );
			expect( trigger ).toHaveAttribute( 'aria-current', 'step' );
		} );
	} );

	it( 'marks the active trigger with aria-expanded="true"', async () => {
		render( <ThreeSteps value="b" /> );
		await waitFor( () => {
			const trigger = screen.getByRole( 'button', { name: /Step B/i } );
			expect( trigger ).toHaveAttribute( 'aria-expanded', 'true' );
		} );
	} );

	it( 'calls onValueChange when a trigger is clicked', async () => {
		const user = userEvent.setup();
		const onValueChange = jest.fn();
		render( <ThreeSteps value="b" onValueChange={ onValueChange } /> );
		await waitFor( () => screen.getByRole( 'button', { name: /Step A/i } ) );
		await user.click( screen.getByRole( 'button', { name: /Step A/i } ) );
		expect( onValueChange ).toHaveBeenCalledWith( 'a' );
	} );

	it( 'wraps triggers in heading elements', async () => {
		render( <ThreeSteps value="a" /> );
		await waitFor( () => screen.getByRole( 'button', { name: /Step A/i } ) );
		const trigger = screen.getByRole( 'button', { name: /Step A/i } );
		// Default headingLevel is 3, so the parent should be h3.
		expect( trigger.closest( 'h3' ) ).toBeInTheDocument();
	} );

	it( 'respects headingLevel prop', async () => {
		render(
			<VerticalStepper aria-label="Test" value="a" headingLevel={ 2 }>
				<VerticalStepper.Step value="a" title="Step A">
					Panel A
				</VerticalStepper.Step>
			</VerticalStepper>
		);
		await waitFor( () => screen.getByRole( 'button', { name: /Step A/i } ) );
		const trigger = screen.getByRole( 'button', { name: /Step A/i } );
		expect( trigger.closest( 'h2' ) ).toBeInTheDocument();
	} );

	it( 'includes accessible step label in indicator', async () => {
		render( <ThreeSteps value="b" /> );
		await waitFor( () => {
			expect( screen.getByText( /Step 2 of 3/i ) ).toBeInTheDocument();
		} );
	} );

	describe( 'linear mode', () => {
		it( 'marks future steps as aria-disabled', async () => {
			render( <ThreeSteps value="a" linear /> );
			await waitFor( () => screen.getByRole( 'button', { name: /Step C/i } ) );
			const futureTrigger = screen.getByRole( 'button', { name: /Step C/i } );
			expect( futureTrigger ).toHaveAttribute( 'aria-disabled', 'true' );
		} );

		it( 'does not fire onValueChange for a disabled future step', async () => {
			const user = userEvent.setup();
			const onValueChange = jest.fn();
			render( <ThreeSteps value="a" onValueChange={ onValueChange } linear /> );
			await waitFor( () => screen.getByRole( 'button', { name: /Step C/i } ) );
			await user.click( screen.getByRole( 'button', { name: /Step C/i } ) );
			expect( onValueChange ).not.toHaveBeenCalled();
		} );
	} );

	it( 'works uncontrolled with defaultValue', async () => {
		render(
			<VerticalStepper aria-label="Uncontrolled" defaultValue="a">
				<VerticalStepper.Step value="a" title="A">
					Panel A
				</VerticalStepper.Step>
				<VerticalStepper.Step value="b" title="B">
					Panel B
				</VerticalStepper.Step>
			</VerticalStepper>
		);
		await waitFor( () => screen.getByRole( 'button', { name: /A/i } ) );
		const trigger = screen.getByRole( 'button', { name: /A/i } );
		expect( trigger ).toHaveAttribute( 'aria-expanded', 'true' );
	} );
} );
