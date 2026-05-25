import { render, screen } from '@testing-library/react';
import { Stepper } from '..';
import { useStepContext } from '../context';
import type { StepContextValue } from '../types';

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

describe( 'Stepper.Step', () => {
	it( 'provides step context to descendants', () => {
		let capturedContext: StepContextValue | null = null;

		function Inspector() {
			capturedContext = useStepContext();
			return null;
		}

		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a" status="completed">
					<Inspector />
				</Stepper.Step>
			</Stepper.Root>
		);

		expect( capturedContext?.isCurrent ).toBe( true );
		expect( capturedContext?.status ).toBe( 'completed' );
		expect( capturedContext?.index ).toBe( 0 );
	} );

	it( 'marks step as disabled when linear and not completed', () => {
		let capturedContext: StepContextValue | null = null;

		function Inspector() {
			capturedContext = useStepContext();
			return null;
		}

		render(
			<Stepper.Root orientation="vertical" value="a" linear aria-label="Test">
				<Stepper.Step value="a">
					<div />
				</Stepper.Step>
				<Stepper.Step value="b">
					<Inspector />
				</Stepper.Step>
			</Stepper.Root>
		);

		expect( capturedContext?.isDisabled ).toBe( true );
	} );
} );
