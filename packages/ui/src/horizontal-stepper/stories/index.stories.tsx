// packages/ui/src/horizontal-stepper/stories/index.stories.tsx
import { useState } from '@wordpress/element';
import { HorizontalStepper } from '..';
import type { IndicatorVariant } from '../../stepper/types';
import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentType } from 'react';

type StoryArgs = {
	'aria-label'?: string;
	linear?: boolean;
	activationMode?: 'auto' | 'manual';
	indicatorVariant?: IndicatorVariant;
};

const meta: Meta< StoryArgs > = {
	component: HorizontalStepper as unknown as ComponentType< StoryArgs >,
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
\`Stepper\` primitives (see **UI/Stepper/Primitives** in the sidebar).
				`,
			},
		},
	},
	argTypes: {
		activationMode: {
			control: { type: 'radio' },
			options: [ 'manual', 'auto' ],
		},
	},
};

export default meta;

type Story = StoryObj< typeof meta >;

const checkoutSteps = [
	{ value: 'shipping', title: 'Shipping' },
	{ value: 'payment', title: 'Payment' },
	{ value: 'review', title: 'Review', optional: true },
];

function DefaultDemo( {
	'aria-label': ariaLabel = 'Checkout',
	linear,
	activationMode,
	indicatorVariant,
}: StoryArgs ) {
	const [ step, setStep ] = useState( 'payment' );
	const currentIndex = checkoutSteps.findIndex( ( s ) => s.value === step );
	return (
		<HorizontalStepper
			aria-label={ ariaLabel }
			linear={ linear }
			activationMode={ activationMode }
			indicatorVariant={ indicatorVariant }
			value={ step }
			onValueChange={ setStep }
		>
			{ checkoutSteps.map( ( s, i ) => (
				<HorizontalStepper.Step
					key={ s.value }
					value={ s.value }
					title={ s.title }
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

function LinearFlowDemo( {
	'aria-label': ariaLabel = 'Linear checkout',
	linear,
	activationMode,
	indicatorVariant,
}: StoryArgs ) {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<HorizontalStepper
			aria-label={ ariaLabel }
			linear={ linear }
			activationMode={ activationMode }
			indicatorVariant={ indicatorVariant }
			value={ step }
			onValueChange={ setStep }
		>
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

function FiveStepsDemo( {
	'aria-label': ariaLabel = '5-step flow',
	linear,
	activationMode,
	indicatorVariant,
}: StoryArgs ) {
	const [ step, setStep ] = useState( 'b' );
	const currentIndex = fiveSteps.findIndex( ( s ) => s.value === step );
	return (
		<HorizontalStepper
			aria-label={ ariaLabel }
			linear={ linear }
			activationMode={ activationMode }
			indicatorVariant={ indicatorVariant }
			value={ step }
			onValueChange={ setStep }
		>
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

function StepVariantsDemo( {
	'aria-label': ariaLabel = 'Step variants',
	linear,
	activationMode,
	indicatorVariant,
}: StoryArgs ) {
	const [ step, setStep ] = useState( 'active' );
	return (
		<HorizontalStepper
			value={ step }
			onValueChange={ setStep }
			aria-label={ ariaLabel }
			linear={ linear }
			activationMode={ activationMode }
			indicatorVariant={ indicatorVariant }
		>
			<HorizontalStepper.Step value="completed" title="Completed" status="completed">
				<p>
					This step has <code>status=&quot;completed&quot;</code>. The indicator shows a check.
				</p>
			</HorizontalStepper.Step>

			<HorizontalStepper.Step value="active" title="Active (current)">
				<p>
					This is the currently selected step. No <code>status</code> prop is needed — active state
					is derived from the stepper&apos;s <code>value</code>.
				</p>
			</HorizontalStepper.Step>

			<HorizontalStepper.Step value="error" title="Error" status="error">
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
	args: {
		'aria-label': 'Step variants',
		linear: false,
		activationMode: 'manual',
	},
	parameters: {
		docs: {
			description: {
				story: `
All states a single step can be in. Click each trigger to switch to it as the active step.

| Prop | Effect |
|---|---|
| _(none)_ | Default appearance — upcoming or active |
| \`status="completed"\` | Check indicator |
| \`status="error"\` | Error indicator; shows description as an error message |
| \`optional\` | Adds an "Optional" label beneath the title |
| \`disabled\` | Trigger is non-interactive; step cannot be clicked |
				`,
			},
		},
	},
	render: StepVariantsDemo,
};

// ---------------------------------------------------------------------------
// Mobile view
// ---------------------------------------------------------------------------

export const MobileView: Story = {
	args: {
		'aria-label': 'Checkout',
		linear: false,
		activationMode: 'manual',
	},
	decorators: [
		( Story ) => (
			<div style={ { maxWidth: 375, margin: '0 auto' } }>
				<Story />
			</div>
		),
	],
	parameters: {
		viewport: {
			defaultViewport: 'mobile1',
		},
		docs: {
			description: {
				story: `
The horizontal stepper rendered at a 375 px mobile width.
Use the toolbar's viewport picker to try other sizes (e.g. \`mobile2\` at 414 px).
				`,
			},
		},
	},
	render: DefaultDemo,
};
