import { render, screen, waitFor } from '@testing-library/react';
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
		expect( capturedContext?.isDisabled ).toBe( true );
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
