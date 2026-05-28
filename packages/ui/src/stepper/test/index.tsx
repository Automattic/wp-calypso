import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from '@wordpress/element';
import { Stepper } from '..';
import { useStepContext } from '../context';
import type { StepContextValue, StepperRef } from '../types';

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
			// @ts-expect-error -- intentionally omitting both aria-label and aria-labelledby to test the runtime warning
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

		expect( capturedContext!.isCurrent ).toBe( true );
		expect( capturedContext!.status ).toBe( 'completed' );
		expect( capturedContext!.index ).toBe( 0 );
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

		expect( capturedContext!.isDisabled ).toBe( true );
	} );

	it( 'sets data-current attribute on the current step', () => {
		const { container } = render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a">
					<div />
				</Stepper.Step>
				<Stepper.Step value="b">
					<div />
				</Stepper.Step>
			</Stepper.Root>
		);
		// Find step elements by looking at children of the accordion root
		// The Accordion.Item renders a div with data-current when active
		const items = container.querySelectorAll( '[data-current]' );
		expect( items ).toHaveLength( 1 );
	} );

	it( 'sets data-status attribute when status is provided', () => {
		const { container } = render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a" status="completed">
					<div />
				</Stepper.Step>
			</Stepper.Root>
		);
		const item = container.querySelector( '[data-status="completed"]' );
		expect( item ).not.toBeNull();
	} );

	it( 'sets data-disabled attribute when disabled', () => {
		const { container } = render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a">
					<div />
				</Stepper.Step>
				<Stepper.Step value="b" disabled>
					<div />
				</Stepper.Step>
			</Stepper.Root>
		);
		const item = container.querySelector( '[data-disabled]' );
		expect( item ).not.toBeNull();
	} );

	it( 'marks step as disabled when explicitly disabled even if completed', () => {
		let capturedContext: StepContextValue | null = null;

		function Inspector() {
			capturedContext = useStepContext();
			return null;
		}

		render(
			<Stepper.Root orientation="vertical" value="a" linear aria-label="Test">
				<Stepper.Step value="a" status="completed" disabled>
					<Inspector />
				</Stepper.Step>
			</Stepper.Root>
		);

		// Completed + explicit disabled = still disabled
		expect( capturedContext!.isDisabled ).toBe( true );
	} );

	it( 'renders as a div in horizontal mode', () => {
		render(
			<Stepper.Root orientation="horizontal" value="a" aria-label="Test">
				<Stepper.Step value="a">
					<div data-testid="content" />
				</Stepper.Step>
			</Stepper.Root>
		);
		// In horizontal mode the step renders a plain <div> (not Accordion.Item)
		expect( screen.getByTestId( 'content' ).parentElement?.tagName ).toBe( 'DIV' );
	} );
} );

describe( 'Stepper.Indicator', () => {
	function renderIndicator( props = {} ) {
		return render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Indicator { ...props } />
				</Stepper.Step>
			</Stepper.Root>
		);
	}

	it( 'renders visually-hidden label for current step', () => {
		renderIndicator();
		expect( screen.getByText( 'Step 1 of 1' ) ).toBeInTheDocument();
	} );

	it( 'renders visually-hidden label with status suffix', () => {
		render(
			<Stepper.Root orientation="vertical" value="b" aria-label="Test">
				<Stepper.Step value="a" status="completed">
					<Stepper.Indicator />
				</Stepper.Step>
				<Stepper.Step value="b">
					<Stepper.Indicator />
				</Stepper.Step>
			</Stepper.Root>
		);
		expect( screen.getByText( 'Step 1 of 2, completed' ) ).toBeInTheDocument();
	} );

	it( 'renders custom indicator children with aria-hidden', () => {
		renderIndicator( { children: <span data-testid="custom-icon" /> } );
		const icon = screen.getByTestId( 'custom-icon' );
		expect( icon.parentElement ).toHaveAttribute( 'aria-hidden', 'true' );
	} );
} );

describe( 'Stepper.Trigger', () => {
	it( 'renders as a button inside a heading in vertical mode', () => {
		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Trigger>Step A</Stepper.Trigger>
					<Stepper.Panel>Content</Stepper.Panel>
				</Stepper.Step>
			</Stepper.Root>
		);
		const button = screen.getByRole( 'button', { name: /step a/i } );
		expect( button ).toBeInTheDocument();
		// Button must be inside a heading
		expect( button.closest( 'h3' ) ).not.toBeNull();
	} );

	it( 'applies aria-current="step" to the active trigger', () => {
		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Trigger>Step A</Stepper.Trigger>
					<Stepper.Panel>Content</Stepper.Panel>
				</Stepper.Step>
			</Stepper.Root>
		);
		expect( screen.getByRole( 'button', { name: /step a/i } ) ).toHaveAttribute(
			'aria-current',
			'step'
		);
	} );

	it( 'renders as a tab in horizontal mode', () => {
		render(
			<Stepper.Root orientation="horizontal" value="a" aria-label="Test">
				<Stepper.List>
					<Stepper.Step value="a">
						<Stepper.Trigger>Step A</Stepper.Trigger>
					</Stepper.Step>
				</Stepper.List>
				<Stepper.Panel value="a">Content</Stepper.Panel>
			</Stepper.Root>
		);
		expect( screen.getByRole( 'tab', { name: /step a/i } ) ).toBeInTheDocument();
	} );

	it( 'uses aria-disabled (not HTML disabled) on a disabled trigger', () => {
		render(
			<Stepper.Root orientation="horizontal" linear value="a" aria-label="Test">
				<Stepper.List>
					<Stepper.Step value="a">
						<Stepper.Trigger>Step A</Stepper.Trigger>
					</Stepper.Step>
					<Stepper.Step value="b">
						<Stepper.Trigger>Step B</Stepper.Trigger>
					</Stepper.Step>
				</Stepper.List>
				<Stepper.Panel value="a">Content A</Stepper.Panel>
				<Stepper.Panel value="b">Content B</Stepper.Panel>
			</Stepper.Root>
		);
		// Step B is disabled by linear flow (not current, not completed)
		const stepBTab = screen.getByRole( 'tab', { name: /step b/i } );
		// Must NOT have HTML disabled (would remove from tab order)
		expect( stepBTab ).not.toHaveAttribute( 'disabled' );
		// MUST have aria-disabled (keeps focusable, communicates state to AT)
		expect( stepBTab ).toHaveAttribute( 'aria-disabled', 'true' );
	} );
} );

describe( 'Stepper.Panel', () => {
	it( 'shows active panel content in vertical mode', () => {
		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Trigger>A</Stepper.Trigger>
					<Stepper.Panel>Panel A content</Stepper.Panel>
				</Stepper.Step>
				<Stepper.Step value="b">
					<Stepper.Trigger>B</Stepper.Trigger>
					<Stepper.Panel>Panel B content</Stepper.Panel>
				</Stepper.Step>
			</Stepper.Root>
		);
		expect( screen.getByText( 'Panel A content' ) ).toBeVisible();
	} );

	it( 'applies role="region" when totalSteps <= 5 in vertical mode', async () => {
		const { container } = render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Trigger>A</Stepper.Trigger>
					<Stepper.Panel>Content</Stepper.Panel>
				</Stepper.Step>
			</Stepper.Root>
		);
		// After effects fire totalSteps becomes 1; panel should have role="region"
		await waitFor( () => {
			const regions = container.querySelectorAll( '[role="region"]:not([aria-label])' );
			expect( regions.length ).toBeGreaterThan( 0 );
		} );
	} );

	it( 'omits role="region" when totalSteps > 5 in vertical mode', async () => {
		const steps = [ 'a', 'b', 'c', 'd', 'e', 'f' ];
		const { container } = render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				{ steps.map( ( v ) => (
					<Stepper.Step key={ v } value={ v }>
						<Stepper.Trigger>{ v }</Stepper.Trigger>
						<Stepper.Panel>Content { v }</Stepper.Panel>
					</Stepper.Step>
				) ) }
			</Stepper.Root>
		);
		// After effects fire totalSteps becomes 6; panels must not have role="region"
		await screen.findByText( 'Content a' );
		await waitFor( () => {
			const unlabelledRegions = container.querySelectorAll( '[role="region"]:not([aria-label])' );
			expect( unlabelledRegions.length ).toBe( 0 );
		} );
	} );
} );

describe( 'Stepper.List', () => {
	it( 'renders a tablist in horizontal mode', () => {
		render(
			<Stepper.Root orientation="horizontal" value="a" aria-label="Test">
				<Stepper.List>
					<Stepper.Step value="a">
						<Stepper.Trigger>Step A</Stepper.Trigger>
					</Stepper.Step>
				</Stepper.List>
				<Stepper.Panel value="a">Content</Stepper.Panel>
			</Stepper.Root>
		);
		expect( screen.getByRole( 'tablist' ) ).toBeInTheDocument();
	} );

	it( 'warns and renders nothing in vertical mode', () => {
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.List>
					<Stepper.Step value="a">
						<Stepper.Trigger>Step A</Stepper.Trigger>
						<Stepper.Panel>Content</Stepper.Panel>
					</Stepper.Step>
				</Stepper.List>
			</Stepper.Root>
		);
		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( 'horizontal mode' ) );
		warn.mockRestore();
	} );
} );

describe( 'Stepper uncontrolled mode', () => {
	it( 'opens the defaultValue step on mount and calls onValueChange on navigation', () => {
		const onValueChange = jest.fn();
		render(
			<Stepper.Root
				orientation="vertical"
				defaultValue="a"
				onValueChange={ onValueChange }
				aria-label="Test"
			>
				<Stepper.Step value="a">
					<Stepper.Trigger>Step A</Stepper.Trigger>
					<Stepper.Panel>Panel A</Stepper.Panel>
				</Stepper.Step>
				<Stepper.Step value="b">
					<Stepper.Trigger>Step B</Stepper.Trigger>
					<Stepper.Panel>Panel B</Stepper.Panel>
				</Stepper.Step>
			</Stepper.Root>
		);
		expect( screen.getByText( 'Panel A' ) ).toBeVisible();
		fireEvent.click( screen.getByRole( 'button', { name: /step b/i } ) );
		expect( onValueChange ).toHaveBeenCalledWith( 'b' );
	} );
} );

describe( 'Stepper.Root focusStep', () => {
	it( 'moves focus to the named trigger via the imperative handle', () => {
		const ref = createRef< StepperRef >();
		render(
			<Stepper.Root orientation="vertical" value="a" ref={ ref } aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Trigger>Step A</Stepper.Trigger>
					<Stepper.Panel>Panel A</Stepper.Panel>
				</Stepper.Step>
				<Stepper.Step value="b">
					<Stepper.Trigger>Step B</Stepper.Trigger>
					<Stepper.Panel>Panel B</Stepper.Panel>
				</Stepper.Step>
			</Stepper.Root>
		);
		ref.current!.focusStep( 'b' );
		expect( screen.getByRole( 'button', { name: /step b/i } ) ).toHaveFocus();
	} );
} );

describe( 'Stepper.Trigger className', () => {
	it( 'applies className to the button only — not to the heading wrapper — in vertical mode', () => {
		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Trigger className="custom-class">Step A</Stepper.Trigger>
					<Stepper.Panel>Panel A</Stepper.Panel>
				</Stepper.Step>
			</Stepper.Root>
		);
		const button = screen.getByRole( 'button', { name: /step a/i } );
		expect( button ).toHaveClass( 'custom-class' );
		expect( button.closest( 'h3' ) ).not.toHaveClass( 'custom-class' );
	} );
} );

describe( 'Stepper.Panel forceMount', () => {
	it( 'keeps panel content in the DOM when the step is not current', () => {
		render(
			<Stepper.Root orientation="vertical" value="b" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Trigger>Step A</Stepper.Trigger>
					<Stepper.Panel forceMount>
						<div data-testid="force-mounted-content" />
					</Stepper.Panel>
				</Stepper.Step>
				<Stepper.Step value="b">
					<Stepper.Trigger>Step B</Stepper.Trigger>
					<Stepper.Panel>
						<div data-testid="active-content" />
					</Stepper.Panel>
				</Stepper.Step>
			</Stepper.Root>
		);
		// Step A is inactive; forceMount keeps its content in the DOM.
		expect( screen.getByTestId( 'force-mounted-content' ) ).toBeInTheDocument();
	} );
} );

describe( 'Stepper.Indicator formatStepLabel', () => {
	it( 'uses the custom formatStepLabel from Root to generate the visually-hidden label', () => {
		const format = jest.fn( ( step: number, total: number ) => `Item ${ step } of ${ total }` );
		render(
			<Stepper.Root orientation="vertical" value="a" formatStepLabel={ format } aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Indicator />
				</Stepper.Step>
			</Stepper.Root>
		);
		expect( screen.getByText( 'Item 1 of 1' ) ).toBeInTheDocument();
	} );
} );

describe( 'Stepper linear mode interaction', () => {
	it( 'does not navigate when a linear-disabled tab is clicked', async () => {
		const onValueChange = jest.fn();
		const user = userEvent.setup();
		render(
			<Stepper.Root
				orientation="horizontal"
				linear
				value="a"
				onValueChange={ onValueChange }
				aria-label="Test"
			>
				<Stepper.List>
					<Stepper.Step value="a">
						<Stepper.Trigger>Step A</Stepper.Trigger>
					</Stepper.Step>
					<Stepper.Step value="b">
						<Stepper.Trigger>Step B</Stepper.Trigger>
					</Stepper.Step>
				</Stepper.List>
				<Stepper.Panel value="a">Content A</Stepper.Panel>
				<Stepper.Panel value="b">Content B</Stepper.Panel>
			</Stepper.Root>
		);
		await user.click( screen.getByRole( 'tab', { name: /step b/i } ) );
		expect( onValueChange ).not.toHaveBeenCalled();
	} );
} );

describe( 'Stepper error status', () => {
	it( 'shows "!" indicator and appends "error" to the accessible label', () => {
		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a" status="error">
					<Stepper.Indicator />
				</Stepper.Step>
			</Stepper.Root>
		);
		expect( screen.getByText( 'Step 1 of 1, error' ) ).toBeInTheDocument();
		expect( screen.getByText( '!' ) ).toBeInTheDocument();
	} );
} );

describe( 'Stepper dynamic step removal', () => {
	it( 'updates totalSteps when a conditional step is removed', async () => {
		function Dynamic() {
			const [ show, setShow ] = useState( true );
			return (
				<>
					<button onClick={ () => setShow( false ) }>remove</button>
					<Stepper.Root orientation="vertical" value="b" aria-label="Test">
						{ show && (
							<Stepper.Step value="a">
								<Stepper.Indicator />
							</Stepper.Step>
						) }
						<Stepper.Step value="b">
							<Stepper.Indicator />
						</Stepper.Step>
					</Stepper.Root>
				</>
			);
		}
		const user = userEvent.setup();
		render( <Dynamic /> );
		// Initially step B is "Step 2 of 2"
		await waitFor( () => expect( screen.getByText( 'Step 2 of 2' ) ).toBeInTheDocument() );
		await user.click( screen.getByRole( 'button', { name: /remove/i } ) );
		// After removing step A, step B becomes "Step 1 of 1"
		await waitFor( () => expect( screen.getByText( 'Step 1 of 1' ) ).toBeInTheDocument() );
	} );
} );

describe( 'Stepper.Panel dev warnings', () => {
	it( 'warns when a horizontal Panel has no matching step value', async () => {
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
		render(
			<Stepper.Root orientation="horizontal" value="a" aria-label="Test">
				<Stepper.List>
					<Stepper.Step value="a">
						<Stepper.Trigger>Step A</Stepper.Trigger>
					</Stepper.Step>
				</Stepper.List>
				<Stepper.Panel value="nonexistent">Content</Stepper.Panel>
			</Stepper.Root>
		);
		await waitFor( () => {
			expect( warn ).toHaveBeenCalledWith(
				expect.stringContaining( "No step found with value 'nonexistent'" )
			);
		} );
		warn.mockRestore();
	} );
} );

describe( 'Stepper indicatorVariant', () => {
	it( 'renders a numeric step label in the indicator when indicatorVariant is "number"', () => {
		render(
			<Stepper.Root orientation="vertical" value="a" indicatorVariant="number" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Indicator />
				</Stepper.Step>
			</Stepper.Root>
		);
		// The number variant renders <span aria-hidden="true">1</span> inside the indicator
		const numericLabel = screen.getByText( '1' );
		expect( numericLabel ).toHaveAttribute( 'aria-hidden', 'true' );
	} );
} );
