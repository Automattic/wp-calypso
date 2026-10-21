// packages/ui/src/stepper/stories/index.stories.tsx
import { useState } from '@wordpress/element';
import { Stepper } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
	title: 'UI/Stepper/Primitives',
	parameters: {
		docs: {
			source: { type: 'dynamic' },
			description: {
				component: `
**Tier 2 — use only when \`HorizontalStepper\` or \`VerticalStepper\` don't fit your layout.**

Reach for these primitives only when neither fits your design: for example, if you need a fully custom trigger layout, the indicator in a non-standard position, or a DOM structure that neither higher-level component can produce.

\`\`\`tsx
// Standard layouts — prefer these
<VerticalStepper value={step} onValueChange={setStep} aria-label="Checkout">
  <VerticalStepper.Step value="shipping" title="Shipping"> ... </VerticalStepper.Step>
</VerticalStepper>

<HorizontalStepper value={step} onValueChange={setStep} aria-label="Checkout">
  <HorizontalStepper.Step value="shipping" title="Shipping"> ... </HorizontalStepper.Step>
</HorizontalStepper>
\`\`\`

### Primitive reference

| Primitive | Renders as | Purpose |
|---|---|---|
| \`Stepper.Root\` | \`Accordion.Root\` or \`Tabs.Root\` | Owns state, context, and orientation |
| \`Stepper.Step\` | \`Accordion.Item\` or \`<div>\` | Groups trigger + panel; holds step value |
| \`Stepper.Trigger\` | \`<hN><button>\` (vertical) or \`<button role="tab">\` (horizontal) | The clickable header |
| \`Stepper.Indicator\` | \`<span>\` | Step number / status icon; you control its position inside the trigger |
| \`Stepper.Title\` | \`<span>\` | Step label text |
| \`Stepper.Description\` | \`<span>\` | Supporting text beneath the title |
| \`Stepper.Panel\` | \`Accordion.Panel\` or \`<div role="tabpanel">\` | Step content area |
| \`Stepper.List\` | \`<div role="tablist">\` | Horizontal-only: wraps all step triggers |
				`,
			},
		},
	},
};

export default meta;

// ---------------------------------------------------------------------------
// Vertical anatomy — shows how VerticalStepper is assembled from primitives
// ---------------------------------------------------------------------------

function VerticalAnatomyDemo() {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<Stepper.Root
			orientation="vertical"
			value={ step }
			onValueChange={ setStep }
			aria-label="Checkout"
			style={ { maxWidth: 400 } }
		>
			<Stepper.Step value="shipping" status="completed">
				<Stepper.Trigger>
					<Stepper.Indicator />
					<div>
						<Stepper.Title>Shipping address</Stepper.Title>
						<Stepper.Description>123 Main St, Springfield</Stepper.Description>
					</div>
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>Shipping form goes here.</p>
				</Stepper.Panel>
			</Stepper.Step>

			<Stepper.Step value="payment">
				<Stepper.Trigger>
					<Stepper.Indicator />
					<Stepper.Title>Payment method</Stepper.Title>
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>Payment form goes here.</p>
				</Stepper.Panel>
			</Stepper.Step>

			<Stepper.Step value="review" optional>
				<Stepper.Trigger>
					<Stepper.Indicator />
					<Stepper.Title>Review order</Stepper.Title>
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>Review form goes here.</p>
				</Stepper.Panel>
			</Stepper.Step>
		</Stepper.Root>
	);
}

export const VerticalAnatomy: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: `
This produces the same output as \`VerticalStepper\` but assembled manually
from primitives. \`VerticalStepper\` is literally just this, pre-composed for you.

Each \`Stepper.Step\` contains its own \`Stepper.Trigger\` and \`Stepper.Panel\`.
Inside the trigger you control what goes next to \`Stepper.Indicator\`: here it
is a \`div\` wrapping \`Stepper.Title\` and \`Stepper.Description\`, but you can
put anything there.
				`,
			},
		},
	},
	render: VerticalAnatomyDemo,
};

// ---------------------------------------------------------------------------
// Horizontal anatomy — shows how HorizontalStepper is assembled from primitives
// ---------------------------------------------------------------------------

function HorizontalAnatomyDemo() {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<Stepper.Root
			orientation="horizontal"
			value={ step }
			onValueChange={ setStep }
			aria-label="Checkout"
		>
			{ /* Stepper.List wraps all triggers — required in horizontal mode */ }
			<Stepper.List>
				<Stepper.Step value="shipping" status="completed">
					<Stepper.Trigger>
						<Stepper.Indicator />
						<Stepper.Title>Shipping</Stepper.Title>
					</Stepper.Trigger>
				</Stepper.Step>

				<Stepper.Step value="payment">
					<Stepper.Trigger>
						<Stepper.Indicator />
						<Stepper.Title>Payment</Stepper.Title>
					</Stepper.Trigger>
				</Stepper.Step>

				<Stepper.Step value="review" optional>
					<Stepper.Trigger>
						<Stepper.Indicator />
						<Stepper.Title>Review</Stepper.Title>
					</Stepper.Trigger>
				</Stepper.Step>
			</Stepper.List>

			{ /* Panels live outside the list — associated to steps by value */ }
			<Stepper.Panel value="shipping">
				<p>Shipping form.</p>
			</Stepper.Panel>
			<Stepper.Panel value="payment">
				<p>Payment form.</p>
			</Stepper.Panel>
			<Stepper.Panel value="review">
				<p>Review form.</p>
			</Stepper.Panel>
		</Stepper.Root>
	);
}

export const HorizontalAnatomy: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: `
The key structural difference from vertical: in horizontal mode, \`Stepper.Panel\`
lives **outside** \`Stepper.Step\` and is associated to its step via the \`value\` prop.
This is what lets you place the panel area freely in the DOM — you are not
constrained to the accordion nesting pattern.

\`Stepper.List\` is required in horizontal mode. It renders as \`role="tablist"\`
and is what \`Stepper.Trigger\` anchors its tab ARIA to.
				`,
			},
		},
	},
	render: HorizontalAnatomyDemo,
};

// ---------------------------------------------------------------------------
// Custom layout — indicator on the right
// ---------------------------------------------------------------------------

const triggerSpaceBetween = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	width: '100%',
};

function CustomLayoutDemo() {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<Stepper.Root
			orientation="vertical"
			value={ step }
			onValueChange={ setStep }
			aria-label="Custom layout"
			style={ { maxWidth: 400 } }
		>
			<Stepper.Step value="shipping" status="completed">
				<Stepper.Trigger style={ triggerSpaceBetween }>
					<Stepper.Title>Shipping address</Stepper.Title>
					<Stepper.Indicator />
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>Shipping form goes here.</p>
				</Stepper.Panel>
			</Stepper.Step>

			<Stepper.Step value="payment">
				<Stepper.Trigger style={ triggerSpaceBetween }>
					<Stepper.Title>Payment method</Stepper.Title>
					<Stepper.Indicator />
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>Payment form goes here.</p>
				</Stepper.Panel>
			</Stepper.Step>

			<Stepper.Step value="review">
				<Stepper.Trigger style={ triggerSpaceBetween }>
					<Stepper.Title>Review order</Stepper.Title>
					<Stepper.Indicator />
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>Review form goes here.</p>
				</Stepper.Panel>
			</Stepper.Step>
		</Stepper.Root>
	);
}

export const CustomLayout: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: `
This layout is **impossible with \`VerticalStepper\`**. The indicator is placed
on the right side of the trigger instead of the left — achieved by reversing
the order of \`Stepper.Title\` and \`Stepper.Indicator\` inside \`Stepper.Trigger\`
and applying \`justify-content: space-between\`.

Because the primitives give you direct control over what goes inside \`Stepper.Trigger\`,
you can put the indicator anywhere, replace it entirely, or add extra elements
alongside it.
				`,
			},
		},
	},
	render: CustomLayoutDemo,
};

// ---------------------------------------------------------------------------
// Custom layout — completion timestamp on the trailing edge
// ---------------------------------------------------------------------------

const triggerWithTimestamp = {
	display: 'flex',
	alignItems: 'center',
	width: '100%',
};

const timestampStyle = {
	marginInlineStart: 'auto',
	fontSize: '12px',
	color: '#787c82',
	fontWeight: 400,
	whiteSpace: 'nowrap' as const,
};

function TriggerWithTimestampDemo() {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<Stepper.Root
			orientation="vertical"
			value={ step }
			onValueChange={ setStep }
			aria-label="Checkout"
			style={ { maxWidth: 400 } }
		>
			<Stepper.Step value="shipping" status="completed">
				<Stepper.Trigger style={ triggerWithTimestamp }>
					<Stepper.Indicator />
					<Stepper.Title>Shipping address</Stepper.Title>
					<span style={ timestampStyle }>Completed 2 min ago</span>
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>123 Main St, Springfield</p>
				</Stepper.Panel>
			</Stepper.Step>

			<Stepper.Step value="payment">
				<Stepper.Trigger style={ triggerWithTimestamp }>
					<Stepper.Indicator />
					<Stepper.Title>Payment method</Stepper.Title>
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>Enter your card details.</p>
				</Stepper.Panel>
			</Stepper.Step>

			<Stepper.Step value="review">
				<Stepper.Trigger style={ triggerWithTimestamp }>
					<Stepper.Indicator />
					<Stepper.Title>Review order</Stepper.Title>
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>Check everything before placing your order.</p>
				</Stepper.Panel>
			</Stepper.Step>
		</Stepper.Root>
	);
}

export const TriggerWithTimestamp: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: `
A completed step shows when it was finished — a trailing element injected directly inside \`Stepper.Trigger\`.

This is impossible with \`VerticalStepper\`: it owns the trigger's internal structure. With primitives you control exactly what sits inside the trigger, so you can push any extra content to the trailing edge alongside the standard indicator and title.
				`,
			},
		},
	},
	render: TriggerWithTimestampDemo,
};
