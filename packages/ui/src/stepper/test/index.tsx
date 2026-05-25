import { render, screen } from '@testing-library/react';
import { Stepper } from '..';

describe( 'Stepper.Root', () => {
	it( 'renders children in vertical orientation', () => {
		render(
			<Stepper.Root orientation="vertical" aria-label="Test stepper">
				<div data-testid="child" />
			</Stepper.Root>
		);
		expect( screen.getByTestId( 'child' ) ).toBeInTheDocument();
	} );

	it( 'renders children in horizontal orientation', () => {
		render(
			<Stepper.Root orientation="horizontal" aria-label="Test stepper">
				<div data-testid="child" />
			</Stepper.Root>
		);
		expect( screen.getByTestId( 'child' ) ).toBeInTheDocument();
	} );

	it( 'warns in dev when neither aria-label nor aria-labelledby is provided', () => {
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
		render(
			// @ts-expect-error — intentionally omitting required a11y prop
			<Stepper.Root orientation="vertical">
				<div />
			</Stepper.Root>
		);
		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( 'aria-label' ) );
		warn.mockRestore();
	} );
} );
