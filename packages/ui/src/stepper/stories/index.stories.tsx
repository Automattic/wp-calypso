// packages/ui/src/stepper/stories/index.stories.tsx
import { useState } from '@wordpress/element';
import { Stepper } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
	title: 'UI/Stepper/Headless (Tier 2)',
	parameters: {
		docs: {
			description: {
				component: `
**Tier 2 — headless primitives. Use only when Tier 1 components don\\'t fit.**

\`VerticalStepper\` and \`HorizontalStepper\` cover the two standard layouts.
Reach for Tier 2 when your design requires a DOM structure or trigger layout
that neither Tier 1 component can produce.

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

**Otherwise, prefer Tier 1:**
- \`VerticalStepper\` — accordion layout, steps expand in place.
- \`HorizontalStepper\` — tab-strip layout, panels render below the list.
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
					<div>
						<Stepper.Title>Review order</Stepper.Title>
						<Stepper.Description>Optional</Stepper.Description>
					</div>
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
from primitives. \`VerticalStepper\` is literally just this — a pre-composed
shorthand.

Each \`Stepper.Step\` contains its own \`Stepper.Trigger\` and \`Stepper.Panel\`.
Inside the trigger you control what goes next to \`Stepper.Indicator\`: here it
is a \`div\` wrapping \`Stepper.Title\` and \`Stepper.Description\`, but you can
put anything there.
				`,
			},
			source: {
				code: `
<Stepper.Root orientation="vertical" value={step} onValueChange={setStep} aria-label="Checkout">
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
      <div>
        <Stepper.Title>Review order</Stepper.Title>
        <Stepper.Description>Optional</Stepper.Description>
      </div>
    </Stepper.Trigger>
    <Stepper.Panel>
      <p>Review form goes here.</p>
    </Stepper.Panel>
  </Stepper.Step>
</Stepper.Root>
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
			source: {
				code: `
<Stepper.Root orientation="horizontal" value={step} onValueChange={setStep} aria-label="Checkout">
  {/* Stepper.List wraps all triggers — required in horizontal mode */}
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

  {/* Panels live outside the list — associated to steps by value */}
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
				`,
			},
		},
	},
	render: HorizontalAnatomyDemo,
};

// ---------------------------------------------------------------------------
// Custom layout — indicator on the right; impossible with Tier 1
// ---------------------------------------------------------------------------

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
				<Stepper.Trigger
					style={ {
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						width: '100%',
					} }
				>
					<Stepper.Title>Shipping address</Stepper.Title>
					<Stepper.Indicator />
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>Shipping form goes here.</p>
				</Stepper.Panel>
			</Stepper.Step>

			<Stepper.Step value="payment">
				<Stepper.Trigger
					style={ {
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						width: '100%',
					} }
				>
					<Stepper.Title>Payment method</Stepper.Title>
					<Stepper.Indicator />
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>Payment form goes here.</p>
				</Stepper.Panel>
			</Stepper.Step>

			<Stepper.Step value="review">
				<Stepper.Trigger
					style={ {
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						width: '100%',
					} }
				>
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

Because Tier 2 gives you direct control over what goes inside \`Stepper.Trigger\`,
you can put the indicator anywhere, replace it entirely, or add extra elements
alongside it — things like a status badge, a timestamp, or a secondary action.
				`,
			},
			source: {
				code: `
<Stepper.Root orientation="vertical" value={step} onValueChange={setStep} aria-label="Custom layout">
  <Stepper.Step value="shipping" status="completed">
    <Stepper.Trigger style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <Stepper.Title>Shipping address</Stepper.Title>
      <Stepper.Indicator /> {/* ← indicator on the right */}
    </Stepper.Trigger>
    <Stepper.Panel>
      <p>Shipping form goes here.</p>
    </Stepper.Panel>
  </Stepper.Step>

  <Stepper.Step value="payment">
    <Stepper.Trigger style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <Stepper.Title>Payment method</Stepper.Title>
      <Stepper.Indicator />
    </Stepper.Trigger>
    <Stepper.Panel>
      <p>Payment form goes here.</p>
    </Stepper.Panel>
  </Stepper.Step>

  <Stepper.Step value="review">
    <Stepper.Trigger style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <Stepper.Title>Review order</Stepper.Title>
      <Stepper.Indicator />
    </Stepper.Trigger>
    <Stepper.Panel>
      <p>Review form goes here.</p>
    </Stepper.Panel>
  </Stepper.Step>
</Stepper.Root>
				`,
			},
		},
	},
	render: CustomLayoutDemo,
};
