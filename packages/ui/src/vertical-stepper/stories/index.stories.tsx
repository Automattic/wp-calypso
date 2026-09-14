// packages/ui/src/vertical-stepper/stories/index.stories.tsx
import { useState } from '@wordpress/element';
import { VerticalStepper } from '..';
import type { IndicatorVariant } from '../../stepper/types';
import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentType } from 'react';

type StoryArgs = {
	'aria-label'?: string;
	linear?: boolean;
	headingLevel?: 2 | 3 | 4 | 5 | 6;
	indicatorVariant?: IndicatorVariant;
};

const meta: Meta< StoryArgs > = {
	component: VerticalStepper as unknown as ComponentType< StoryArgs >,
	title: 'UI/Stepper/Vertical',
	parameters: {
		docs: {
			source: { type: 'dynamic' },
			description: {
				component: `
**Tier 1 — use this in product UI.**

\`VerticalStepper\` is the ready-to-use, styled stepper for accordion-style flows
where each step expands in place. It handles layout, indicators, and accessibility
automatically. You only need to supply step values, titles, and content.

\`\`\`tsx
<VerticalStepper value={step} onValueChange={setStep} aria-label="Checkout">
  <VerticalStepper.Step value="shipping" title="Shipping" status="completed">
    ...
  </VerticalStepper.Step>
</VerticalStepper>
\`\`\`

If you need a tab-strip layout instead, use \`HorizontalStepper\`.
If you need a completely custom layout or DOM structure, use the headless
\`Stepper\` primitives (see **UI/Stepper/Primitives** in the sidebar).
				`,
			},
		},
	},
	argTypes: {
		headingLevel: {
			control: { type: 'select' },
			options: [ 2, 3, 4, 5, 6 ],
		},
	},
};

export default meta;

type Story = StoryObj< typeof meta >;

function DefaultDemo( {
	'aria-label': ariaLabel = 'Checkout',
	linear,
	headingLevel,
	indicatorVariant,
}: StoryArgs ) {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<VerticalStepper
			aria-label={ ariaLabel }
			linear={ linear }
			headingLevel={ headingLevel }
			indicatorVariant={ indicatorVariant }
			value={ step }
			onValueChange={ setStep }
			style={ { maxWidth: 400 } }
		>
			<VerticalStepper.Step
				value="shipping"
				title="Shipping address"
				status="completed"
				description="123 Main St, Springfield"
			>
				<p>Shipping form.</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="payment" title="Payment method">
				<p>Payment form.</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="review" title="Review order" optional>
				<p>Review form.</p>
			</VerticalStepper.Step>
		</VerticalStepper>
	);
}

export const Default: Story = {
	args: {
		'aria-label': 'Checkout',
		linear: false,
		headingLevel: 3,
	},
	render: DefaultDemo,
};

function LinearFlowDemo( {
	'aria-label': ariaLabel = 'Linear checkout',
	linear,
	headingLevel,
	indicatorVariant,
}: StoryArgs ) {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<VerticalStepper
			aria-label={ ariaLabel }
			linear={ linear }
			headingLevel={ headingLevel }
			indicatorVariant={ indicatorVariant }
			value={ step }
			onValueChange={ setStep }
			style={ { maxWidth: 400 } }
		>
			<VerticalStepper.Step value="shipping" title="Shipping" status="completed">
				<p>Done.</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="payment" title="Payment (current)">
				<p>Fill this out.</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="review" title="Review (locked)">
				<p>Not reachable yet.</p>
			</VerticalStepper.Step>
		</VerticalStepper>
	);
}

export const LinearFlow: Story = {
	args: {
		'aria-label': 'Linear checkout',
		linear: true,
		headingLevel: 3,
	},
	render: LinearFlowDemo,
};

// ---------------------------------------------------------------------------
// Back navigation — clicking a completed step triggers "go back" logic
// ---------------------------------------------------------------------------

const onboardingSteps = [
	{ value: 'account', title: 'Create account' },
	{ value: 'domain', title: 'Choose a domain' },
	{ value: 'plan', title: 'Select a plan' },
	{ value: 'payment', title: 'Payment' },
];

function BackNavigationDemo() {
	const [ currentStep, setCurrentStep ] = useState( 'plan' );
	const [ log, setLog ] = useState< string[] >( [ 'Started at "Select a plan" (step 3 of 4)' ] );

	const currentIndex = onboardingSteps.findIndex( ( s ) => s.value === currentStep );

	function handleStepClick( clickedStep: string ) {
		const clickedIndex = onboardingSteps.findIndex( ( s ) => s.value === clickedStep );
		const stepsBack = currentIndex - clickedIndex;
		setLog( ( prev ) => [
			`Navigated back ${ stepsBack } step(s) → "${ onboardingSteps[ clickedIndex ].title }"`,
			...prev,
		] );
		setCurrentStep( clickedStep );
	}

	function handleContinue() {
		const next = onboardingSteps[ currentIndex + 1 ];
		if ( next ) {
			setLog( ( prev ) => [ `Continued → "${ next.title }"`, ...prev ] );
			setCurrentStep( next.value );
		}
	}

	return (
		<div style={ { display: 'flex', gap: 40, alignItems: 'flex-start' } }>
			<VerticalStepper
				value={ currentStep }
				onValueChange={ handleStepClick }
				linear
				aria-label="Onboarding"
				style={ { maxWidth: 360, flex: '0 0 360px' } }
			>
				{ onboardingSteps.map( ( s, i ) => (
					<VerticalStepper.Step
						key={ s.value }
						value={ s.value }
						title={ s.title }
						status={ i < currentIndex ? 'completed' : undefined }
					>
						<p>Content for { s.title }.</p>
						{ i === currentIndex && i < onboardingSteps.length - 1 && (
							<button onClick={ handleContinue }>Continue →</button>
						) }
					</VerticalStepper.Step>
				) ) }
			</VerticalStepper>

			<div>
				<p>
					<strong>Navigation log</strong>
				</p>
				<ul style={ { margin: 0, padding: '0 0 0 16px' } }>
					{ log.map( ( entry, i ) => (
						<li key={ i } style={ { color: i === 0 ? 'inherit' : '#999', marginBottom: 4 } }>
							{ entry }
						</li>
					) ) }
				</ul>
			</div>
		</div>
	);
}

export const BackNavigation: Story = {
	parameters: {
		docs: {
			description: {
				story: `
Demonstrates how to integrate the stepper with an existing navigation flow where
clicking a completed step means "go back".

The stepper is **controlled** — \`value\` is owned by the flow, not the stepper.
\`linear={true}\` ensures only completed (previous) steps are clickable, so
\`onValueChange\` only ever fires when the user navigates backward. The handler
receives the clicked step's value and can run whatever back-navigation logic the
flow requires.

\`\`\`tsx
<VerticalStepper
  value={ currentStep }
  onValueChange={ ( clickedStep ) => {
    // linear={true} guarantees this is always a previous step
    navigateTo( clickedStep );
  } }
  linear
  aria-label="Onboarding"
>
  { steps.map( ( s, i ) => (
    <VerticalStepper.Step
      key={ s.value }
      value={ s.value }
      title={ s.title }
      status={ i < currentIndex ? 'completed' : undefined }
    >
      ...
    </VerticalStepper.Step>
  ) ) }
</VerticalStepper>
\`\`\`

**Try it:** Click any completed step (check) to go back. Use "Continue →" to
advance. The log on the right shows what the \`onValueChange\` handler received.
				`,
			},
		},
	},
	render: BackNavigationDemo,
};

function WithErrorDemo( {
	'aria-label': ariaLabel = 'Checkout with error',
	linear,
	headingLevel,
	indicatorVariant,
}: StoryArgs ) {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<VerticalStepper
			aria-label={ ariaLabel }
			linear={ linear }
			headingLevel={ headingLevel }
			indicatorVariant={ indicatorVariant }
			value={ step }
			onValueChange={ setStep }
			style={ { maxWidth: 400 } }
		>
			<VerticalStepper.Step
				value="shipping"
				title="Shipping"
				status="error"
				description="Invalid address"
			>
				<p>Fix the address.</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="payment" title="Payment">
				<p>Payment form.</p>
			</VerticalStepper.Step>
		</VerticalStepper>
	);
}

export const WithError: Story = {
	args: {
		'aria-label': 'Checkout with error',
		linear: false,
		headingLevel: 3,
	},
	render: WithErrorDemo,
};

// ---------------------------------------------------------------------------
// Step variants — one example of every status/state a step can be in
// ---------------------------------------------------------------------------

function StepVariantsDemo() {
	const [ step, setStep ] = useState( 'active' );
	return (
		<VerticalStepper
			value={ step }
			onValueChange={ setStep }
			aria-label="Step variants"
			style={ { maxWidth: 400 } }
		>
			<VerticalStepper.Step
				value="completed"
				title="Completed"
				status="completed"
				description="Payment received"
			>
				<p>
					This step has <code>status=&quot;completed&quot;</code>. It shows a check indicator and a
					summary description beneath the title.
				</p>
			</VerticalStepper.Step>

			<VerticalStepper.Step value="active" title="Active (current)">
				<p>
					This is the currently open step. No <code>status</code> prop is needed — the component
					derives active state from the stepper&apos;s <code>value</code>.
				</p>
			</VerticalStepper.Step>

			<VerticalStepper.Step
				value="error"
				title="Error"
				status="error"
				description="Invalid card number"
			>
				<p>
					This step has <code>status=&quot;error&quot;</code>. Use it to flag validation failures
					that need the user&apos;s attention before continuing.
				</p>
			</VerticalStepper.Step>

			<VerticalStepper.Step value="optional" title="Optional" optional>
				<p>
					This step has <code>optional</code> set. An &quot;Optional&quot; label appears beneath the
					title when no <code>description</code> is provided.
				</p>
			</VerticalStepper.Step>

			<VerticalStepper.Step value="upcoming" title="Upcoming (default)">
				<p>
					A plain step with no special props — the default appearance for an unvisited upcoming
					step.
				</p>
			</VerticalStepper.Step>

			<VerticalStepper.Step value="disabled" title="Disabled" disabled>
				<p>
					This step has <code>disabled</code> set. The trigger is not interactive and the step
					cannot be opened by the user.
				</p>
			</VerticalStepper.Step>
		</VerticalStepper>
	);
}

export const StepVariants: Story = {
	parameters: {
		docs: {
			description: {
				story: `
All states a single step can be in. Click each trigger to open it as the active step.

> **Accessibility note:** This story has 6 steps, so \`role="region"\` is omitted from
> all panels (see the **LandmarkThreshold** story for a full explanation). Open DevTools
> and inspect a panel element to verify — you will see a plain \`<div>\`, not
> \`<div role="region">\`.

| Prop | Effect |
|---|---|
| _(none)_ | Default appearance — upcoming or active |
| \`status="completed"\` | Check indicator; shows description as a summary |
| \`status="error"\` | Error indicator; shows description as an error message |
| \`optional\` | Adds an "Optional" label when no \`description\` is provided |
| \`disabled\` | Trigger is non-interactive; step cannot be opened |
				`,
			},
		},
	},
	render: StepVariantsDemo,
};

// ---------------------------------------------------------------------------
// Landmark threshold — role="region" behaviour at 5 vs 6+ steps
// ---------------------------------------------------------------------------

function FiveStepDemo() {
	const [ step, setStep ] = useState( 'a' );
	const steps = [ 'a', 'b', 'c', 'd', 'e' ];
	return (
		<VerticalStepper
			value={ step }
			onValueChange={ setStep }
			aria-label="5-step flow"
			style={ { maxWidth: 400 } }
		>
			{ steps.map( ( s ) => (
				<VerticalStepper.Step key={ s } value={ s } title={ `Step ${ s.toUpperCase() }` }>
					<p>
						Panel for step { s.toUpperCase() }. Open DevTools → inspect this element → it should
						have <code>role=&quot;region&quot;</code>.
					</p>
				</VerticalStepper.Step>
			) ) }
		</VerticalStepper>
	);
}

function SixStepDemo() {
	const [ step, setStep ] = useState( 'a' );
	const steps = [ 'a', 'b', 'c', 'd', 'e', 'f' ];
	return (
		<VerticalStepper
			value={ step }
			onValueChange={ setStep }
			aria-label="6-step flow"
			style={ { maxWidth: 400 } }
		>
			{ steps.map( ( s ) => (
				<VerticalStepper.Step key={ s } value={ s } title={ `Step ${ s.toUpperCase() }` }>
					<p>
						Panel for step { s.toUpperCase() }. Open DevTools → inspect this element → it should be
						a plain <code>&lt;div&gt;</code> with no <code>role</code>.
					</p>
				</VerticalStepper.Step>
			) ) }
		</VerticalStepper>
	);
}

export const LandmarkThreshold: Story = {
	parameters: {
		docs: {
			description: {
				story: `
**Accessibility behaviour: \`role="region"\` is omitted when there are more than 5 steps.**

Each open panel in a vertical stepper is a content region. When there are 5 or fewer
steps, each panel gets \`role="region"\` with an accessible label so screen reader users
can jump between panels using landmark navigation (e.g. \`F6\` in NVDA, \`Ctrl+F7\` in
JAWS).

When there are 6 or more steps, \`role="region"\` is omitted from all panels. Too many
landmarks create noise — screen readers read out every landmark when the user requests
a list, making navigation harder rather than easier. The panels are still fully
reachable via Tab and arrow keys; they just don't appear as named landmarks.

**How to verify with DevTools:**
1. Open the story, expand a step.
2. In DevTools Elements panel, find the open panel \`<div>\`.
3. **5 steps** → \`role="region"\` is present.
4. **6 steps** → no \`role\` attribute.
				`,
			},
		},
	},
	render() {
		return (
			<div style={ { display: 'flex', gap: 40 } }>
				<div style={ { flex: 1 } }>
					<p>
						<strong>5 steps</strong> — panels have <code>role=&quot;region&quot;</code>
					</p>
					<FiveStepDemo />
				</div>
				<div style={ { flex: 1 } }>
					<p>
						<strong>6 steps</strong> — panels are plain <code>&lt;div&gt;</code>
					</p>
					<SixStepDemo />
				</div>
			</div>
		);
	},
};
