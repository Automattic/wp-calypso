// packages/ui/src/horizontal-stepper/stories/index.stories.tsx
import { useState } from '@wordpress/element';
import { HorizontalStepper } from '..';
import type { StepperProps } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof HorizontalStepper > = {
	component: HorizontalStepper,
	title: 'UI/Stepper/Horizontal',
	parameters: {
		docs: {
			source: { type: 'dynamic' },
			description: {
				component: `
**Tier 1 — use this in product UI.**

\`HorizontalStepper\` is the ready-to-use, styled stepper for tab-strip flows
where the step list sits at the top and panels render below. It handles layout,
indicators, and accessibility automatically. You only need to supply step
values, titles, and content.

\`\`\`tsx
<HorizontalStepper value={step} onValueChange={setStep} aria-label="Checkout">
  <HorizontalStepper.Step value="shipping" title="Shipping" status="completed">
    ...
  </HorizontalStepper.Step>
</HorizontalStepper>
\`\`\`

If you need an accordion layout instead, use \`VerticalStepper\`.
If you need a completely custom layout or DOM structure, use the headless
\`Stepper\` primitives (see **UI/Stepper/Headless (Tier 2)** in the sidebar).
				`,
			},
		},
	},
	argTypes: {
		activationMode: {
			control: { type: 'radio' },
			options: [ 'manual', 'auto' ],
		},
		// Managed internally by the story's useState — hide from controls.
		value: { table: { disable: true } },
		defaultValue: { table: { disable: true } },
		onValueChange: { table: { disable: true } },
		// Complex / render-only props — not useful as controls.
		children: { table: { disable: true } },
		className: { table: { disable: true } },
		style: { table: { disable: true } },
		ref: { table: { disable: true } },
		formatStepLabel: { table: { disable: true } },
		headingLevel: { table: { disable: true } },
		'aria-labelledby': { table: { disable: true } },
	},
};

export default meta;

type Story = StoryObj< typeof meta >;

const checkoutSteps = [
	{ value: 'shipping', title: 'Shipping', description: '123 Main St' },
	{ value: 'payment', title: 'Payment' },
	{ value: 'review', title: 'Review', optional: true },
];

function DefaultDemo( args: StepperProps ) {
	const [ step, setStep ] = useState( 'payment' );
	const currentIndex = checkoutSteps.findIndex( ( s ) => s.value === step );
	return (
		<HorizontalStepper { ...args } value={ step } onValueChange={ setStep }>
			{ checkoutSteps.map( ( s, i ) => (
				<HorizontalStepper.Step
					key={ s.value }
					value={ s.value }
					title={ s.title }
					description={ s.description }
					status={ i < currentIndex ? 'completed' : undefined }
					optional={ s.optional }
				>
					<p>{ s.title } form.</p>
				</HorizontalStepper.Step>
			) ) }
		</HorizontalStepper>
	);
}

export const Default: Story = {
	args: {
		'aria-label': 'Checkout',
		linear: false,
		activationMode: 'manual',
	},
	render: DefaultDemo,
};

function LinearFlowDemo( args: StepperProps ) {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<HorizontalStepper { ...args } value={ step } onValueChange={ setStep }>
			<HorizontalStepper.Step value="shipping" title="Shipping" status="completed">
				<p>Done.</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="payment" title="Payment">
				<p>Fill this out.</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="review" title="Review">
				<p>Not reachable yet.</p>
			</HorizontalStepper.Step>
		</HorizontalStepper>
	);
}

export const LinearFlow: Story = {
	args: {
		'aria-label': 'Linear checkout',
		linear: true,
		activationMode: 'manual',
	},
	render: LinearFlowDemo,
};

const fiveSteps = [
	{ value: 'a', title: 'Purchase info' },
	{ value: 'b', title: 'Shipping details' },
	{ value: 'c', title: 'Review' },
	{ value: 'd', title: 'Review again' },
	{ value: 'e', title: 'Review once again' },
];

function FiveStepsDemo( args: StepperProps ) {
	const [ step, setStep ] = useState( 'b' );
	const currentIndex = fiveSteps.findIndex( ( s ) => s.value === step );
	return (
		<HorizontalStepper { ...args } value={ step } onValueChange={ setStep }>
			{ fiveSteps.map( ( s, i ) => (
				<HorizontalStepper.Step
					key={ s.value }
					value={ s.value }
					title={ s.title }
					status={ i < currentIndex ? 'completed' : undefined }
				>
					<p>Content for { s.title }</p>
				</HorizontalStepper.Step>
			) ) }
		</HorizontalStepper>
	);
}

export const FiveSteps: Story = {
	args: {
		'aria-label': '5-step flow',
		linear: false,
		activationMode: 'manual',
	},
	render: FiveStepsDemo,
};

// ---------------------------------------------------------------------------
// Step variants — one example of every status/state a step can be in
// ---------------------------------------------------------------------------

function StepVariantsDemo() {
	const [ step, setStep ] = useState( 'active' );
	return (
		<HorizontalStepper value={ step } onValueChange={ setStep } aria-label="Step variants">
			<HorizontalStepper.Step
				value="completed"
				title="Completed"
				status="completed"
				description="Payment received"
			>
				<p>
					This step has <code>status=&quot;completed&quot;</code>. The indicator shows a check and
					the connector line to the next step turns green.
				</p>
			</HorizontalStepper.Step>

			<HorizontalStepper.Step value="active" title="Active (current)">
				<p>
					This is the currently selected step. No <code>status</code> prop is needed — active state
					is derived from the stepper&apos;s <code>value</code>.
				</p>
			</HorizontalStepper.Step>

			<HorizontalStepper.Step
				value="error"
				title="Error"
				status="error"
				description="Invalid card number"
			>
				<p>
					This step has <code>status=&quot;error&quot;</code>. Use it to flag a validation failure
					that needs the user&apos;s attention.
				</p>
			</HorizontalStepper.Step>

			<HorizontalStepper.Step value="optional" title="Optional" optional>
				<p>
					This step has <code>optional</code> set. An &quot;Optional&quot; label appears beneath the
					title.
				</p>
			</HorizontalStepper.Step>

			<HorizontalStepper.Step value="upcoming" title="Upcoming">
				<p>A plain step with no special props — the default appearance for an unvisited step.</p>
			</HorizontalStepper.Step>

			<HorizontalStepper.Step value="disabled" title="Disabled" disabled>
				<p>
					This step has <code>disabled</code> set. The trigger is not interactive and cannot be
					clicked.
				</p>
			</HorizontalStepper.Step>
		</HorizontalStepper>
	);
}

export const StepVariants: Story = {
	parameters: {
		docs: {
			description: {
				story: `
All states a single step can be in. Click each trigger to switch to it as the active step.

| Prop | Effect |
|---|---|
| _(none)_ | Default appearance — upcoming or active |
| \`status="completed"\` | Check indicator; connector line to next step turns green |
| \`status="error"\` | Error indicator; shows description as an error message |
| \`optional\` | Adds an "Optional" label beneath the title |
| \`disabled\` | Trigger is non-interactive; step cannot be clicked |
				`,
			},
		},
	},
	render: StepVariantsDemo,
};
