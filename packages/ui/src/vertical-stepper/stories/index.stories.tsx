// packages/ui/src/vertical-stepper/stories/index.stories.tsx
import { useState } from '@wordpress/element';
import { VerticalStepper } from '..';
import type { StepperProps } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof VerticalStepper > = {
	component: VerticalStepper,
	title: 'UI/Stepper/Vertical',
	parameters: {
		docs: {
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
\`Stepper\` primitives (see **UI/Stepper/Headless (Tier 2)** in the sidebar).
				`,
			},
		},
	},
	argTypes: {
		headingLevel: {
			control: { type: 'select' },
			options: [ 2, 3, 4, 5, 6 ],
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
		'aria-labelledby': { table: { disable: true } },
	},
};

export default meta;

type Story = StoryObj< typeof meta >;

function DefaultDemo( args: StepperProps ) {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<VerticalStepper
			{ ...args }
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

function LinearFlowDemo( args: StepperProps ) {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<VerticalStepper
			{ ...args }
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

function WithErrorDemo( args: StepperProps ) {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<VerticalStepper
			{ ...args }
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
