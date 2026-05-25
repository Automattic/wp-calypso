// packages/ui/src/vertical-stepper/test/index.tsx
import { render, screen } from '@testing-library/react';
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
} );
