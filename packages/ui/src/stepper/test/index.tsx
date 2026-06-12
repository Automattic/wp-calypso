import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from '@wordpress/element';
import { Stepper } from '..';
import type { StepperRef } from '../types';

describe( 'Stepper.Root', () => {
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
	it( 'marks the active step with data-current attribute', () => {
		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a" className="step-a">
					<Stepper.Trigger>Step A</Stepper.Trigger>
				</Stepper.Step>
				<Stepper.Step value="b" className="step-b">
					<Stepper.Trigger>Step B</Stepper.Trigger>
				</Stepper.Step>
			</Stepper.Root>
		);
		const stepA = document.querySelector( '.step-a' );
		const stepB = document.querySelector( '.step-b' );
		expect( stepA ).toHaveAttribute( 'data-current', '' );
		expect( stepB ).not.toHaveAttribute( 'data-current' );
	} );

	it.each( [
		{
			label: 'linear flow — non-completed step',
			props: { linear: true, value: 'a' as const },
			stepBProps: {} as object,
		},
		{
			label: 'explicit disabled — overrides completed status',
			props: { value: 'a' as const },
			stepBProps: { disabled: true, status: 'completed' as const },
		},
	] )( 'marks step with data-disabled: $label', async ( { props, stepBProps } ) => {
		render(
			<Stepper.Root orientation="vertical" aria-label="Test" { ...props }>
				<Stepper.Step value="a" status="completed" className="step-a">
					<Stepper.Trigger>Step A</Stepper.Trigger>
				</Stepper.Step>
				<Stepper.Step value="b" className="step-b" { ...stepBProps }>
					<Stepper.Trigger>Step B</Stepper.Trigger>
				</Stepper.Step>
			</Stepper.Root>
		);
		await waitFor( () => {
			expect( document.querySelector( '.step-b' ) ).toHaveAttribute( 'data-disabled', '' );
		} );
	} );

	it( 'sets data-current attribute on the current step', () => {
		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Trigger>Step A</Stepper.Trigger>
				</Stepper.Step>
				<Stepper.Step value="b">
					<Stepper.Trigger>Step B</Stepper.Trigger>
				</Stepper.Step>
			</Stepper.Root>
		);
		const buttonA = screen.getByRole( 'button', { name: /step a/i } );
		expect( buttonA.closest( '[data-current]' ) ).not.toBeNull();
		const buttonB = screen.getByRole( 'button', { name: /step b/i } );
		expect( buttonB.closest( '[data-current]' ) ).toBeNull();
	} );

	it( 'sets data-status attribute when status is provided', () => {
		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a" status="completed">
					<Stepper.Trigger>Step A</Stepper.Trigger>
				</Stepper.Step>
			</Stepper.Root>
		);
		const button = screen.getByRole( 'button', { name: /step a/i } );
		const container = button.closest( '[data-status]' );
		expect( container ).toHaveAttribute( 'data-status', 'completed' );
	} );

	it( 'sets data-disabled attribute when disabled', () => {
		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Trigger>Step A</Stepper.Trigger>
				</Stepper.Step>
				<Stepper.Step value="b" disabled>
					<Stepper.Trigger>Step B</Stepper.Trigger>
				</Stepper.Step>
			</Stepper.Root>
		);
		const buttonA = screen.getByRole( 'button', { name: /step a/i } );
		expect( buttonA.closest( '[data-disabled]' ) ).toBeNull();
		const buttonB = screen.getByRole( 'button', { name: /step b/i } );
		expect( buttonB.closest( '[data-disabled]' ) ).not.toBeNull();
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

	it( 'wraps custom indicator children so they are hidden from the accessibility tree', () => {
		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Indicator>
						<span data-testid="custom-icon">★</span>
					</Stepper.Indicator>
				</Stepper.Step>
			</Stepper.Root>
		);
		const icon = screen.getByTestId( 'custom-icon' );
		expect( icon ).toBeInTheDocument();
		// The custom icon should not be reachable as a standalone accessible element.
		// It exists in the DOM but is decorative — the indicator's visually-hidden
		// label is the only accessible text inside the indicator.
		expect( icon.closest( '[aria-hidden="true"]' ) ).not.toBeNull();
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

	it( 'renders trigger inside h2 when headingLevel is 2', () => {
		render(
			<Stepper.Root orientation="vertical" value="a" headingLevel={ 2 } aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Trigger>Step A</Stepper.Trigger>
					<Stepper.Panel>Content</Stepper.Panel>
				</Stepper.Step>
			</Stepper.Root>
		);
		const button = screen.getByRole( 'button', { name: /step a/i } );
		expect( button.closest( 'h2' ) ).not.toBeNull();
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

	it( 'does not collapse the active panel when the active vertical trigger is re-clicked', async () => {
		const user = userEvent.setup();
		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Trigger>Step A</Stepper.Trigger>
					<Stepper.Panel value="a">Panel A</Stepper.Panel>
				</Stepper.Step>
			</Stepper.Root>
		);
		expect( screen.getByText( 'Panel A' ) ).toBeVisible();
		await user.click( screen.getByRole( 'button', { name: /step a/i } ) );
		// Panel must remain visible — the trigger's preventDefault guard should
		// prevent the accordion from collapsing the only active step.
		expect( screen.getByText( 'Panel A' ) ).toBeVisible();
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

	it( 'applies role="region" to all panels at the 5-step boundary', async () => {
		const steps = [ 'a', 'b', 'c', 'd', 'e' ];
		render(
			<Stepper.Root orientation="vertical" value="a" aria-label="Test">
				{ steps.map( ( v ) => (
					<Stepper.Step key={ v } value={ v }>
						<Stepper.Trigger>{ v }</Stepper.Trigger>
						<Stepper.Panel>Content { v }</Stepper.Panel>
					</Stepper.Step>
				) ) }
			</Stepper.Root>
		);
		await waitFor( () => {
			const panelRegion = screen
				.getAllByRole( 'region' )
				.find( ( el ) => el.hasAttribute( 'aria-labelledby' ) );
			expect( panelRegion ).toBeDefined();
		} );
	} );

	it( 'omits role="region" on panels when totalSteps > 5 in vertical mode', async () => {
		render(
			<Stepper.Root orientation="vertical" value="0" aria-label="Test">
				{ Array.from( { length: 6 }, ( _, i ) => (
					<Stepper.Step key={ i } value={ String( i ) }>
						<Stepper.Panel value={ String( i ) }>Content { i }</Stepper.Panel>
					</Stepper.Step>
				) ) }
			</Stepper.Root>
		);
		await waitFor( () => {
			// With > 5 steps, panels must not carry role="region" (too many landmarks).
			// The only region landmark should be the root Accordion element (aria-label="Test").
			const regions = screen.queryAllByRole( 'region' );
			const panelRegions = regions.filter( ( el ) => el.hasAttribute( 'aria-labelledby' ) );
			expect( panelRegions ).toHaveLength( 0 );
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

describe( 'Stepper.Panel keepMounted', () => {
	it( 'keeps panel content in the DOM when the step is not current', () => {
		render(
			<Stepper.Root orientation="vertical" value="b" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Trigger>Step A</Stepper.Trigger>
					<Stepper.Panel keepMounted>
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
		// Step A is inactive; keepMounted keeps its content in the DOM.
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

	it( 'navigates to a completed past step in linear mode', async () => {
		const onValueChange = jest.fn();
		const user = userEvent.setup();
		render(
			<Stepper.Root
				orientation="horizontal"
				linear
				value="b"
				onValueChange={ onValueChange }
				aria-label="Test"
			>
				<Stepper.List>
					<Stepper.Step value="a" status="completed">
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
		await user.click( screen.getByRole( 'tab', { name: /step a/i } ) );
		expect( onValueChange ).toHaveBeenCalledWith( 'a' );
	} );

	it( 'navigates to an error-status step in linear mode', async () => {
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
					<Stepper.Step value="a" status="completed">
						<Stepper.Trigger>Step A</Stepper.Trigger>
					</Stepper.Step>
					<Stepper.Step value="b" status="error">
						<Stepper.Trigger>Step B</Stepper.Trigger>
					</Stepper.Step>
				</Stepper.List>
				<Stepper.Panel value="a">Content A</Stepper.Panel>
				<Stepper.Panel value="b">Content B</Stepper.Panel>
			</Stepper.Root>
		);
		await user.click( screen.getByRole( 'tab', { name: /step b/i } ) );
		expect( onValueChange ).toHaveBeenCalledWith( 'b' );
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

describe( 'Stepper dev warnings', () => {
	it( 'warns when value does not match any step', async () => {
		const spy = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
		render(
			<Stepper.Root orientation="vertical" value="z" aria-label="Test">
				<Stepper.Step value="a">
					<Stepper.Indicator />
				</Stepper.Step>
			</Stepper.Root>
		);
		await waitFor( () => {
			expect( spy ).toHaveBeenCalledWith(
				expect.stringContaining( "No step found with value 'z'" )
			);
		} );
		spy.mockRestore();
	} );

	// NOTE: A test for the duplicate-value warning ("Two steps share value '...'") is
	// deliberately omitted. useStepRegistration prevents duplicate entries at registration
	// time (it bails out if a step with the same value is already in state), so the
	// steps array that the useEffect in root.tsx inspects will never contain duplicates.
	// The warning is unreachable in a JSDOM environment via normal JSX rendering, making
	// any such test a never-fails assertion that proves nothing about real behaviour.
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

	// NOTE: warning() dedupes messages process-wide, so this test relies on being
	// the only place in this file that triggers the missing-`value` message.
	it( 'warns when a horizontal Panel has no value prop and no StepContext', async () => {
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
		render(
			<Stepper.Root orientation="horizontal" value="a" aria-label="Test">
				<Stepper.List>
					<Stepper.Step value="a">
						<Stepper.Trigger>Step A</Stepper.Trigger>
					</Stepper.Step>
				</Stepper.List>
				<Stepper.Panel>Content</Stepper.Panel>
			</Stepper.Root>
		);
		await waitFor( () => {
			expect( warn ).toHaveBeenCalledWith( expect.stringMatching( /value/ ) );
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

describe( 'Stepper activationMode', () => {
	it( 'activates tab on arrow-key focus when activationMode is "auto"', async () => {
		const user = userEvent.setup();
		render(
			<Stepper.Root
				orientation="horizontal"
				activationMode="auto"
				defaultValue="a"
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
				<Stepper.Panel value="a">Panel A content</Stepper.Panel>
				<Stepper.Panel value="b">Panel B content</Stepper.Panel>
			</Stepper.Root>
		);
		await user.tab();
		await user.keyboard( '{ArrowRight}' );
		expect( screen.getByText( 'Panel B content' ) ).toBeVisible();
	} );
} );

describe( 'Stepper.Step disabled in vertical mode', () => {
	it( 'does not fire onValueChange when a disabled accordion trigger is clicked', async () => {
		const onValueChange = jest.fn();
		const user = userEvent.setup();
		render(
			<Stepper.Root
				orientation="vertical"
				value="a"
				onValueChange={ onValueChange }
				aria-label="Test"
			>
				<Stepper.Step value="a">
					<Stepper.Trigger>Step A</Stepper.Trigger>
					<Stepper.Panel>Content A</Stepper.Panel>
				</Stepper.Step>
				<Stepper.Step value="b" disabled>
					<Stepper.Trigger>Step B</Stepper.Trigger>
					<Stepper.Panel>Content B</Stepper.Panel>
				</Stepper.Step>
			</Stepper.Root>
		);
		await user.click( screen.getByRole( 'button', { name: /step b/i } ) );
		expect( onValueChange ).not.toHaveBeenCalled();
	} );
} );

describe( 'Stepper.Panel keepMounted horizontal', () => {
	it( 'keeps horizontal panel content in the DOM when the step is not current', () => {
		render(
			<Stepper.Root orientation="horizontal" value="b" aria-label="Test">
				<Stepper.List>
					<Stepper.Step value="a">
						<Stepper.Trigger>Step A</Stepper.Trigger>
					</Stepper.Step>
					<Stepper.Step value="b">
						<Stepper.Trigger>Step B</Stepper.Trigger>
					</Stepper.Step>
				</Stepper.List>
				<Stepper.Panel value="a" keepMounted>
					<div data-testid="force-mounted-h" />
				</Stepper.Panel>
				<Stepper.Panel value="b">Panel B content</Stepper.Panel>
			</Stepper.Root>
		);
		expect( screen.getByTestId( 'force-mounted-h' ) ).toBeInTheDocument();
	} );
} );
