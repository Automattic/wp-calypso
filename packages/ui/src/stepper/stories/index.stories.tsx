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

\`Stepper\` exposes the raw, unstyled building blocks that \`VerticalStepper\` and
\`HorizontalStepper\` are composed from. You assemble the layout yourself using
\`Stepper.Root\`, \`Stepper.Step\`, \`Stepper.Trigger\`, \`Stepper.Indicator\`,
\`Stepper.Title\`, \`Stepper.Description\`, \`Stepper.Panel\`, and \`Stepper.List\`.

**When to reach for Tier 2:**
- Your design requires a DOM structure the Tier 1 wrappers cannot produce.
- You need to mix stepper primitives with other custom elements in unusual ways.
- You are building a new Tier 1 wrapper for a different orientation or style.

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
// Vertical — accordion pattern
// ---------------------------------------------------------------------------

function VerticalBasicRender() {
	const [ step, setStep ] = useState( 'shipping' );
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

export const VerticalBasic: StoryObj = {
	render: () => <VerticalBasicRender />,
};

// ---------------------------------------------------------------------------
// Horizontal — tabs pattern
// ---------------------------------------------------------------------------

function HorizontalBasicRender() {
	const [ step, setStep ] = useState( 'shipping' );
	return (
		<Stepper.Root
			orientation="horizontal"
			value={ step }
			onValueChange={ setStep }
			aria-label="Checkout"
		>
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

export const HorizontalBasic: StoryObj = {
	render: () => <HorizontalBasicRender />,
};

// ---------------------------------------------------------------------------
// Linear flow
// ---------------------------------------------------------------------------

function LinearFlowRender() {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<Stepper.Root
			orientation="vertical"
			value={ step }
			onValueChange={ setStep }
			linear
			aria-label="Linear checkout"
			style={ { maxWidth: 400 } }
		>
			<Stepper.Step value="shipping" status="completed">
				<Stepper.Trigger>
					<Stepper.Indicator />
					<Stepper.Title>Shipping</Stepper.Title>
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>Done.</p>
				</Stepper.Panel>
			</Stepper.Step>
			<Stepper.Step value="payment">
				<Stepper.Trigger>
					<Stepper.Indicator />
					<Stepper.Title>Payment (current)</Stepper.Title>
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>Pay here.</p>
				</Stepper.Panel>
			</Stepper.Step>
			<Stepper.Step value="review">
				<Stepper.Trigger>
					<Stepper.Indicator />
					<Stepper.Title>Review (locked)</Stepper.Title>
				</Stepper.Trigger>
				<Stepper.Panel>
					<p>Not reachable yet.</p>
				</Stepper.Panel>
			</Stepper.Step>
		</Stepper.Root>
	);
}

export const LinearFlow: StoryObj = {
	render: () => <LinearFlowRender />,
};
