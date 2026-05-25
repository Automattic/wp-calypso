// packages/ui/src/horizontal-stepper/test/index.tsx
import { render, screen } from '@testing-library/react';
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

	it( 'renders a tablist', () => {
		render( <Controlled /> );
		expect( screen.getByRole( 'tablist' ) ).toBeInTheDocument();
	} );

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
} );
