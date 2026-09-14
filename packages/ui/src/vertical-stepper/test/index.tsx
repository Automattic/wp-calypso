// packages/ui/src/vertical-stepper/test/index.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from '@wordpress/element';
import { VerticalStepper } from '..';

describe( 'VerticalStepper', () => {
	function Controlled() {
		const [ step, setStep ] = useState( 'a' );
		return (
			<VerticalStepper value={ step } onValueChange={ setStep } aria-label="Test stepper">
				<VerticalStepper.Step value="a" title="Step A" status="completed">
					<p>Panel A</p>
				</VerticalStepper.Step>
				<VerticalStepper.Step value="b" title="Step B" description="Do B">
					<p>Panel B</p>
				</VerticalStepper.Step>
			</VerticalStepper>
		);
	}

	it( 'renders step titles as buttons inside headings', () => {
		render( <Controlled /> );
		const btn = screen.getByRole( 'button', { name: /step a/i } );
		expect( btn ).toBeInTheDocument();
		expect( btn.closest( 'h3' ) ).not.toBeNull();
	} );

	it( 'shows the active panel', () => {
		render( <Controlled /> );
		expect( screen.getByText( 'Panel A' ) ).toBeVisible();
	} );

	it( 'switches panels on trigger click', async () => {
		const user = userEvent.setup();
		render( <Controlled /> );
		await user.click( screen.getByRole( 'button', { name: /step b/i } ) );
		expect( screen.getByText( 'Panel B' ) ).toBeVisible();
	} );

	it( 'renders description when provided', () => {
		render( <Controlled /> );
		expect( screen.getByText( 'Do B' ) ).toBeInTheDocument();
	} );

	it( 'accepts a custom headingLevel', () => {
		render(
			<VerticalStepper value="a" headingLevel={ 2 } aria-label="Test">
				<VerticalStepper.Step value="a" title="Step A">
					<p />
				</VerticalStepper.Step>
			</VerticalStepper>
		);
		expect( screen.getByRole( 'button', { name: /step a/i } ).closest( 'h2' ) ).not.toBeNull();
	} );

	it( 'shows "Optional" text for a step with optional prop', () => {
		render(
			<VerticalStepper value="a" aria-label="Test">
				<VerticalStepper.Step value="a" title="Step A" optional>
					<p>Content</p>
				</VerticalStepper.Step>
			</VerticalStepper>
		);
		expect( screen.getByText( 'Optional' ) ).toBeInTheDocument();
	} );
} );

describe( 'VerticalStepper behavioral', () => {
	it( 'calls onValueChange when switching steps', async () => {
		const onValueChange = jest.fn();
		const user = userEvent.setup();
		render(
			<VerticalStepper value="a" onValueChange={ onValueChange } aria-label="Test">
				<VerticalStepper.Step value="a" title="Step A">
					<p>Panel A</p>
				</VerticalStepper.Step>
				<VerticalStepper.Step value="b" title="Step B">
					<p>Panel B</p>
				</VerticalStepper.Step>
			</VerticalStepper>
		);
		await user.click( screen.getByRole( 'button', { name: /step b/i } ) );
		expect( onValueChange ).toHaveBeenCalledWith( 'b' );
	} );

	it( 'does not fire onValueChange when a disabled step trigger is clicked', async () => {
		const onValueChange = jest.fn();
		const user = userEvent.setup();
		render(
			<VerticalStepper value="a" onValueChange={ onValueChange } aria-label="Test">
				<VerticalStepper.Step value="a" title="Step A">
					<p>Panel A</p>
				</VerticalStepper.Step>
				<VerticalStepper.Step value="b" title="Step B" disabled>
					<p>Panel B</p>
				</VerticalStepper.Step>
			</VerticalStepper>
		);
		await user.click( screen.getByRole( 'button', { name: /step b/i } ) );
		expect( onValueChange ).not.toHaveBeenCalled();
	} );

	it( 'opens the defaultValue step in uncontrolled mode', async () => {
		render(
			<VerticalStepper defaultValue="b" aria-label="Test">
				<VerticalStepper.Step value="a" title="Step A">
					<p>Panel A</p>
				</VerticalStepper.Step>
				<VerticalStepper.Step value="b" title="Step B">
					<p>Panel B</p>
				</VerticalStepper.Step>
			</VerticalStepper>
		);
		await waitFor( () => expect( screen.getByText( 'Panel B' ) ).toBeVisible() );
	} );

	it( 'keeps inactive panel content in the DOM when keepMounted is set', async () => {
		render(
			<VerticalStepper value="b" aria-label="Test">
				<VerticalStepper.Step value="a" title="Step A" keepMounted>
					<p data-testid="force-mounted">Panel A</p>
				</VerticalStepper.Step>
				<VerticalStepper.Step value="b" title="Step B">
					<p>Panel B</p>
				</VerticalStepper.Step>
			</VerticalStepper>
		);
		// Step A is inactive but keepMounted keeps its panel in the DOM
		expect( await screen.findByTestId( 'force-mounted' ) ).toBeInTheDocument();
	} );
} );

describe( 'VerticalStepper linear mode', () => {
	it( 'does not navigate to a non-completed step', async () => {
		const onValueChange = jest.fn();
		const user = userEvent.setup();
		render(
			<VerticalStepper value="a" linear onValueChange={ onValueChange } aria-label="Test">
				<VerticalStepper.Step value="a" title="Step A">
					<p>Panel A</p>
				</VerticalStepper.Step>
				<VerticalStepper.Step value="b" title="Step B">
					<p>Panel B</p>
				</VerticalStepper.Step>
			</VerticalStepper>
		);
		await user.click( screen.getByRole( 'button', { name: /step b/i } ) );
		expect( onValueChange ).not.toHaveBeenCalled();
	} );

	it( 'navigates to a completed past-step', async () => {
		const onValueChange = jest.fn();
		const user = userEvent.setup();
		render(
			<VerticalStepper value="b" linear onValueChange={ onValueChange } aria-label="Test">
				<VerticalStepper.Step value="a" title="Step A" status="completed">
					<p>Panel A</p>
				</VerticalStepper.Step>
				<VerticalStepper.Step value="b" title="Step B">
					<p>Panel B</p>
				</VerticalStepper.Step>
			</VerticalStepper>
		);
		await user.click( screen.getByRole( 'button', { name: /step a/i } ) );
		expect( onValueChange ).toHaveBeenCalledWith( 'a' );
	} );
} );
