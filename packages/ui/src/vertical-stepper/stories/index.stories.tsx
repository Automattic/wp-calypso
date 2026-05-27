// packages/ui/src/vertical-stepper/stories/index.stories.tsx
import { useState } from '@wordpress/element';
import { VerticalStepper } from '..';
import type { StepperProps } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof VerticalStepper > = {
	component: VerticalStepper,
	title: 'Automattic UI/VerticalStepper',
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
