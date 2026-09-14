// packages/ui/src/horizontal-stepper/test/index.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from '@wordpress/element';
import { HorizontalStepper } from '..';

describe( 'HorizontalStepper', () => {
	function Controlled() {
		const [ step, setStep ] = useState( 'a' );
		return (
			<HorizontalStepper value={ step } onValueChange={ setStep } aria-label="Test stepper">
				<HorizontalStepper.Step value="a" title="Step A" status="completed">
					<p>Panel A</p>
				</HorizontalStepper.Step>
				<HorizontalStepper.Step value="b" title="Step B">
					<p>Panel B</p>
				</HorizontalStepper.Step>
			</HorizontalStepper>
		);
	}

	it( 'renders step titles as tabs', () => {
		render( <Controlled /> );
		expect( screen.getByRole( 'tab', { name: /step a/i } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'tab', { name: /step b/i } ) ).toBeInTheDocument();
	} );

	it( 'shows the active panel', () => {
		render( <Controlled /> );
		expect( screen.getByText( 'Panel A' ) ).toBeVisible();
	} );

	it( 'switches panels on tab click', async () => {
		const user = userEvent.setup();
		render( <Controlled /> );
		await user.click( screen.getByRole( 'tab', { name: /step b/i } ) );
		expect( screen.getByText( 'Panel B' ) ).toBeVisible();
	} );

	it( 'renders aria-disabled (not HTML disabled) on a disabled step tab', async () => {
		render(
			<HorizontalStepper value="a" aria-label="Test">
				<HorizontalStepper.Step value="a" title="Step A">
					<p>Panel A</p>
				</HorizontalStepper.Step>
				<HorizontalStepper.Step value="b" title="Step B" disabled>
					<p>Panel B</p>
				</HorizontalStepper.Step>
			</HorizontalStepper>
		);
		const tab = await screen.findByRole( 'tab', { name: /step b/i } );
		expect( tab ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( tab ).not.toHaveAttribute( 'disabled' );
	} );

	it( 'keeps inactive panel content in the DOM when keepMounted is set', async () => {
		render(
			<HorizontalStepper value="a" aria-label="Test">
				<HorizontalStepper.Step value="a" title="Step A">
					<p>Panel A</p>
				</HorizontalStepper.Step>
				<HorizontalStepper.Step value="b" title="Step B" keepMounted>
					<p data-testid="force-mounted">Panel B</p>
				</HorizontalStepper.Step>
			</HorizontalStepper>
		);
		// Step B is inactive but keepMounted keeps its panel in the DOM
		expect( await screen.findByTestId( 'force-mounted' ) ).toBeInTheDocument();
	} );

	it( 'opens the defaultValue step in uncontrolled mode', async () => {
		render(
			<HorizontalStepper defaultValue="b" aria-label="Test">
				<HorizontalStepper.Step value="a" title="Step A">
					<p>Panel A</p>
				</HorizontalStepper.Step>
				<HorizontalStepper.Step value="b" title="Step B">
					<p>Panel B</p>
				</HorizontalStepper.Step>
			</HorizontalStepper>
		);
		await waitFor( () => expect( screen.getByText( 'Panel B' ) ).toBeVisible() );
	} );

	it( 'does not call onValueChange when an explicitly disabled step tab is clicked', async () => {
		const onValueChange = jest.fn();
		const user = userEvent.setup();
		render(
			<HorizontalStepper value="a" onValueChange={ onValueChange } aria-label="Test">
				<HorizontalStepper.Step value="a" title="Step A">
					<p>Panel A</p>
				</HorizontalStepper.Step>
				<HorizontalStepper.Step value="b" title="Step B" disabled>
					<p>Panel B</p>
				</HorizontalStepper.Step>
			</HorizontalStepper>
		);
		await user.click( screen.getByRole( 'tab', { name: /step b/i } ) );
		expect( onValueChange ).not.toHaveBeenCalled();
	} );
} );

describe( 'HorizontalStepper linear mode', () => {
	it( 'does not navigate to a non-completed step', async () => {
		const onValueChange = jest.fn();
		const user = userEvent.setup();
		render(
			<HorizontalStepper value="a" linear onValueChange={ onValueChange } aria-label="Test">
				<HorizontalStepper.Step value="a" title="Step A">
					<p>Panel A</p>
				</HorizontalStepper.Step>
				<HorizontalStepper.Step value="b" title="Step B">
					<p>Panel B</p>
				</HorizontalStepper.Step>
			</HorizontalStepper>
		);
		await user.click( screen.getByRole( 'tab', { name: /step b/i } ) );
		expect( onValueChange ).not.toHaveBeenCalled();
	} );

	it( 'navigates to a completed past-step', async () => {
		const onValueChange = jest.fn();
		const user = userEvent.setup();
		render(
			<HorizontalStepper value="b" linear onValueChange={ onValueChange } aria-label="Test">
				<HorizontalStepper.Step value="a" title="Step A" status="completed">
					<p>Panel A</p>
				</HorizontalStepper.Step>
				<HorizontalStepper.Step value="b" title="Step B">
					<p>Panel B</p>
				</HorizontalStepper.Step>
			</HorizontalStepper>
		);
		await user.click( screen.getByRole( 'tab', { name: /step a/i } ) );
		expect( onValueChange ).toHaveBeenCalledWith( 'a' );
	} );
} );
